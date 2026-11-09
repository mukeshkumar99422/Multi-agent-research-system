function parseBlock(block) {
  let event = 'message'
  const dataLines = []

  for (const line of block.split('\n')) {
    if (!line || line.startsWith(':')) continue
    if (line.startsWith('event:')) event = line.slice(6).trim()
    else if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart())
  }

  if (dataLines.length === 0) return null

  const raw = dataLines.join('\n')
  try {
    return { event, data: JSON.parse(raw) }
  } catch {
    return { event, data: raw }
  }
}

/**
 * Parse a fetch() response body as Server-Sent Events.
 * Yields { event, data } for each event. `data` is parsed JSON when possible.
 * Comment lines (": ping" keep-alives) are ignored.
 */
export async function* parseSSE(body) {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      // normalise line endings on the whole buffer so "\r" / "\n" split across chunks still match
      buffer = (buffer + decoder.decode(value, { stream: true })).replace(/\r\n/g, '\n')

      const blocks = buffer.split('\n\n')
      buffer = blocks.pop() // keep the incomplete block for the next chunk

      for (const block of blocks) {
        const evt = parseBlock(block)
        if (evt) yield evt
      }
    }

    // flush anything left when the stream closes
    buffer += decoder.decode()
    const last = parseBlock(buffer.replace(/\r\n/g, '\n'))
    if (last) yield last
  } finally {
    reader.cancel().catch(() => {})
  }
}



/**
 * Parse a fetch() response body as JSON and return the error message.
 * @param {*} res 
 * @returns Parsed error
 */
export async function readErrorMessage(res) {
  try {
    const body = await res.json()
    // FastAPI validation errors: { detail: [{ msg: "..." }, ...] }
    if (Array.isArray(body.detail) && body.detail[0]?.msg) return body.detail[0].msg
    if (typeof body.detail === 'string') return body.detail
  } catch {
    // body was not JSON
  }
  return `Request failed (${res.status})`
}
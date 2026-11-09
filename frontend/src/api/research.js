import { parseSSE, readErrorMessage } from '../lib/sse'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1'

/**
 * POST + streaming means: use fetch (bcs EventSource only supports GET).
 * EventSource is a browser API used to receive Server-Sent Events (SSE).
 * EventSource provide parsed events:
 *  const es = new EventSource(url)
 *  es.onmessage = (e) => { console.log(e.data) }
 * But here we need custom parser: parseSSE
 */

/**
 * Usage: for await (const { event, data } of streamResearch(topic, signal)) { ... }
 */
export async function* streamResearch(topic, signal) {
  const res = await fetch(`${API_BASE_URL}/research`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({ topic }),
    signal,
  })

  if (!res.ok) {
    throw new Error(await readErrorMessage(res))
  }

  yield* parseSSE(res.body)
}


/**
 * warm up backend while user type api
 */
export function warmUpBackend() {
  fetch(`${API_BASE_URL}/health`).catch(() => {});
}
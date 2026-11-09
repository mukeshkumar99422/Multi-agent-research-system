## Tech Stack
- Python 3.12, FastAPI, Uvicorn
- Pydantic and pydantic-settings (validation and config)
- LangChain with Google Gemini (`gemini-3.5-flash-lite`)
- Tavily (web search), BeautifulSoup (scraping)
- uv (package manager), pytest (tests)

## Project Structure

```
backend/
├── pyproject.toml
├── .env.example
├── app/
│   ├── main.py                  # app creation, CORS, router
│   ├── core/config.py           # settings loaded from .env
│   ├── api/
│   │   ├── router.py            # collects all routes
│   │   └── routes/
│   │       ├── health.py        # GET  /health
│   │       └── research.py      # POST /research (SSE stream)
│   ├── schemas/research.py      # request and event models
│   ├── services/
│   │   └── research_service.py  # 4-step pipeline as an async stream
│   └── agents/
│       ├── agents.py            # model, search/reader agents, writer/critic chains
│       └── tools.py             # web_search and scrape_url tools
└── tests/test_api.py
```

## Setup

### 1. Install dependencies

```bash
cd backend
uv sync
```

### 2. Add environment variables

Copy `.env.example` to `.env` and fill in your keys:

```env
GOOGLE_API_KEY=your_google_gemini_api_key
TAVILY_API_KEY=your_tavily_api_key
CORS_ORIGINS=["http://localhost:5173"]
```
The server will not start if either API key is missing.

### 3. Run the server

```bash
uv run fastapi dev
```

- API base URL: `http://127.0.0.1:8000/api/v1`
- Interactive docs: `http://127.0.0.1:8000/docs`

## API Reference

Base path: `/api/v1`

### GET `/health`

Checks that the server is running.

**Response `200`**

```json
{ "status": "ok" }
```

### POST `/research`

Runs the full pipeline for a topic and streams progress as Server-Sent Events.

**Request body**

```json
{ "topic": "Quantum computing breakthroughs in 2025" }
```

| Field | Type | Rules |
|---|---|---|
| `topic` | string | Required, 3 to 200 characters |

**Responses**

| Status | Meaning |
|---|---|
| `200` | Stream started (`Content-Type: text/event-stream`) |
| `422` | Invalid request body (for example, topic too short) |

Pipeline failures after the stream has started are sent as an `error` event, not as an HTTP error status.

## Stream Events

Each event has a name and a JSON `data` payload. The server may also send `: ping` comment lines as keep-alives. Clients should ignore them.

### `step`

Sent when a pipeline step starts and when it finishes. Each step sends two events, in this order: `search`, `reader`, `writer`, `critic`.

```
event: step
data: {"step":"search","status":"running","output":null}

event: step
data: {"step":"search","status":"done","output":"Title: ...\nURL: ..."}
```

| Field | Type | Description |
|---|---|---|
| `step` | `"search"` \| `"reader"` \| `"writer"` \| `"critic"` | Which stage |
| `status` | `"running"` \| `"done"` | Stage state |
| `output` | string or `null` | The stage's result. Only set when `status` is `"done"` |

### `complete`

Sent once after all four steps finish. This is the last event on success.

```
event: complete
data: {"topic":"...","search":"...","reader":"...","report":"...","critic":"..."}
```

| Field | Description |
|---|---|
| `topic` | The topic that was researched |
| `search` | Raw search results |
| `reader` | Scraped content |
| `report` | The final report (Markdown) |
| `critic` | The critic's review (score, strengths, improvements, verdict) |

### `error`

Sent if any step fails. This is the last event on failure.

```
event: error
data: {"step":"search","message":"The research pipeline failed. Please try again."}
```

The full exception is written to the server logs.

## Example: curl

```bash
curl -N -X POST http://127.0.0.1:8000/api/v1/research \
  -H "Content-Type: application/json" \
  -d '{"topic":"quantum computing breakthroughs"}'
```

The `-N` flag turns off buffering so events appear as they arrive.
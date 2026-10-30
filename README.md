# Multi-Agent Research System

A multi-agent AI pipeline that takes a research topic and produces a structured research report, followed by a critical review of that report. Four specialized stages work one after another, each passing its output to the next.

## Core Idea

Instead of asking one LLM to "research and write everything" in a single prompt, the work is split into focused roles:

1. **Search Agent** - searches the web for recent, reliable information on the topic.
2. **Reader Agent** - picks the most relevant URL from the search results and scrapes it for deeper content.
3. **Writer Chain** - combines the search results and scraped content into a structured report.
4. **Critic Chain** - reviews the finished report, gives it a score, and lists strengths and areas to improve.

Each stage has one job, which keeps prompts short and outputs easier to inspect and debug.

## Features

- Four-stage pipeline: search, read, write, critique
- Live web search through Tavily
- Web page scraping with clean text extraction
- Structured report: Introduction, Key Findings, Conclusion, Sources
- Critic review with a score out of 10, strengths, improvements, and a one-line verdict
- Streamlit web interface with a step-by-step pipeline status panel
- Raw search and scraped output viewable in expandable sections
- Download the final report as a Markdown (`.md`) file
- Command-line mode for running the pipeline without the UI

## Tools & Technology

| Area | Technology |
|---|---|
| Language | Python 3.10+ |
| LLM | Google Gemini (`gemini-3.5-flash-lite`) |
| LLM orchestration | LangChain (`create_agent`, prompt templates, output parsers) |
| Model loading | `langchain.chat_models.init_chat_model` with `langchain-google-genai` |
| Web search | Tavily (`tavily-python`) |
| Web scraping | `requests` + `BeautifulSoup4` |
| UI | Streamlit |
| Config | `python-dotenv` |

## Project Structure

```
Multi-agent-research-system/
├── agents.py          # Model setup, search/reader agents, writer and critic chains
├── tools.py           # web_search (Tavily) and scrape_url tools
├── pipeline.py        # Runs the 4 steps in the terminal
├── app.py             # Streamlit UI
├── requirements.txt   # Python dependencies
├── .gitignore         # Keeps .env out of git
└── README.md
```

## How to Use Locally

### 1. Prerequisites

- Python 3.10 or newer
- A Google Gemini API key: https://aistudio.google.com/apikey
- A Tavily API key: https://app.tavily.com

### 2. Set up the environment

```bash
cd Multi-agent-research-system

# create and activate a virtual environment
python -m venv venv

# macOS / Linux
source venv/bin/activate
# Windows (PowerShell)
venv\Scripts\Activate.ps1

# install dependencies
pip install -r requirements.txt
```

### 3. Add your API keys

Create a file named `.env` in the project root (same folder as `app.py`):

```env
GOOGLE_API_KEY=your_google_gemini_api_key
TAVILY_API_KEY=your_tavily_api_key
```

`.env` is already listed in `.gitignore`, so your keys will not be committed.

### 4. Run the app

**Streamlit UI**

```bash
streamlit run app.py
```

Open http://localhost:8501, type a research topic, and click **Run Research Pipeline**.

**Command line**

```bash
python pipeline.py
```

Enter a topic when prompted. Each step's output is printed in the terminal.

## Notes

- The reader step scrapes one URL and keeps the first 3000 characters of its text, so some sites (login-walled or script-rendered pages) may return little content.
- Free-tier Gemini and Tavily keys have rate limits. If a run fails midway, wait a moment and try again.

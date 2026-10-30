import streamlit as st
import time
from agents import build_reader_agent, build_search_agent, writer_chain, critic_chain

# ── Page config ──────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="ResearchMind · AI Research Agent",
    page_icon="🔬",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ── Helper: render a step card ────────────────────────────────────────────────
def step_card(num: str, title: str, state: str, desc: str = ""):
    status_map = {
        "waiting": ("WAITING", "status-waiting"),
        "running": ("RUNNING", "status-running"),
        "done":    ("DONE",    "status-done"),
    }
    label, cls = status_map.get(state, ("", ""))
    with st.container(border=True):
        st.markdown(f"**{num} - {title}** &nbsp;|&nbsp; {label}")
        if desc:
            st.caption(desc)


# ── Session state init ────────────────────────────────────────────────────────
for key in ("results", "running", "done"):
    if key not in st.session_state:
        st.session_state[key] = {} if key == "results" else False


# ── Header ────────────────────────────────────────────────────────────────────
st.title("ResearchMind")
st.caption("Multi-Agent AI System")
st.write(
    "Four specialized AI agents collaborate - searching, scraping, writing, "
    "and critiquing - to deliver a research report on any topic."
)
st.divider()


# ── Layout: input left, pipeline right ───────────────────────────────────────
col_input, col_spacer, col_pipeline = st.columns([5, 0.5, 4])

with col_input:
    topic = st.text_input(
        "Research Topic",
        placeholder="e.g. Quantum computing breakthroughs in 2025",
        key="topic_input",
        label_visibility="visible",
    )
    run_btn = st.button("Run Research Pipeline", use_container_width=True)

    # Example topics
    examples = ["LLM agents 2025", "CRISPR gene editing", "Fusion energy progress"]
    st.caption("Try: " + "  |  ".join(examples))

with col_pipeline:
    st.subheader("Pipeline")

    r = st.session_state.results
    done = st.session_state.done

    def s(step):
        r = st.session_state.results   # re-read so live updates see fresh results
        if not r and not st.session_state.running:
            return "waiting"
        steps = ["search", "reader", "writer", "critic"]
        idx = steps.index(step)
        completed = list(r.keys())
        # figure out which steps are done
        if step in r:
            return "done"
        # which step is running now (first not in r)
        if st.session_state.running:
            for i, k in enumerate(steps):
                if k not in r:
                    return "running" if k == step else "waiting"
        return "waiting"

    # one placeholder per step so cards can be redrawn while the pipeline runs
    step_slots = [st.empty() for _ in range(4)]

    def render_steps():
        step_defs = [
            ("01", "Search Agent", "search", "Gathers recent web information"),
            ("02", "Reader Agent", "reader", "Scrapes & extracts deep content"),
            ("03", "Writer Chain", "writer", "Drafts the full research report"),
            ("04", "Critic Chain", "critic", "Reviews & scores the report"),
        ]
        for slot, (num, title, key, desc) in zip(step_slots, step_defs):
            with slot.container():
                step_card(num, title, s(key), desc)

    render_steps()


# ── Run pipeline ──────────────────────────────────────────────────────────────
if run_btn:
    if not topic.strip():
        st.warning("Please enter a research topic first.")
    else:
        st.session_state.results = {}
        st.session_state.running = True
        st.session_state.done = False
        st.rerun()

if st.session_state.running and not st.session_state.done:
    results = {}
    topic_val = st.session_state.topic_input

    # ── Step 1: Search ──
    with st.spinner("Search Agent is working…"):
        search_agent = build_search_agent()
        sr = search_agent.invoke({
            "messages": [("user", f"Find recent, reliable and detailed information about: {topic_val}")]
        })
        results["search"] = sr["messages"][-1].content
        st.session_state.results = dict(results)
    render_steps()
    st.rerun() if False else None   # keep inline for now

    # ── Step 2: Reader ──
    with st.spinner("Reader Agent is scraping top resources…"):
        reader_agent = build_reader_agent()
        rr = reader_agent.invoke({
            "messages": [("user",
                f"Based on the following search results about '{topic_val}', "
                f"pick the most relevant URL and scrape it for deeper content.\n\n"
                f"Search Results:\n{results['search'][:800]}"
            )]
        })
        results["reader"] = rr["messages"][-1].content
        st.session_state.results = dict(results)
    render_steps()

    # ── Step 3: Writer ──
    with st.spinner("Writer is drafting the report…"):
        research_combined = (
            f"SEARCH RESULTS:\n{results['search']}\n\n"
            f"DETAILED SCRAPED CONTENT:\n{results['reader']}"
        )
        results["writer"] = writer_chain.invoke({
            "topic": topic_val,
            "research": research_combined
        })
        st.session_state.results = dict(results)
    render_steps()

    # ── Step 4: Critic ──
    with st.spinner("Critic is reviewing the report…"):
        results["critic"] = critic_chain.invoke({
            "report": results["writer"]
        })
        st.session_state.results = dict(results)
    render_steps()

    st.session_state.running = False
    st.session_state.done = True
    st.rerun()


# ── Results display ───────────────────────────────────────────────────────────
r = st.session_state.results

if r:
    st.divider()
    st.subheader("Results")

    # Raw outputs in expanders
    if "search" in r:
        with st.expander("Search Results (raw)", expanded=False):
            st.text(r["search"])

    if "reader" in r:
        with st.expander("Scraped Content (raw)", expanded=False):
            st.text(r["reader"])

    # Final report
    if "writer" in r:
        st.subheader("Final Research Report")
        st.markdown(r["writer"])   # render markdown natively

        # Download
        st.download_button(
            label="Download Report (.md)",
            data=r["writer"],
            file_name=f"research_report_{int(time.time())}.md",
            mime="text/markdown",
        )

    # Critic feedback
    if "critic" in r:
        st.subheader("Critic Feedback")
        st.markdown(r["critic"])


# ── Footer ────────────────────────────────────────────────────────────────────
st.caption("ResearchMind · Powered by LangChain multi-agent pipeline · Built with Streamlit")
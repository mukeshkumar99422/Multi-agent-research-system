import logging
from collections.abc import AsyncIterator
from fastapi.sse import ServerSentEvent
from app.agents.agents import (
    build_reader_agent,
    build_search_agent,
    critic_chain,
    writer_chain,
)
from app.schemas.research import CompleteEvent, ErrorEvent, StepEvent, StepName

logger = logging.getLogger(__name__)


def _as_text(content) -> str:
    """Gemini can return content as a list of blocks; always hand back plain text."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, str):
                parts.append(block)
            elif isinstance(block, dict) and block.get("type") == "text":
                parts.append(block.get("text", ""))
        return "".join(parts)
    return str(content)


def _step(step: StepName, status: str, output: str | None = None) -> ServerSentEvent:
    return ServerSentEvent(
        event="step",
        data=StepEvent(step=step, status=status, output=output),
    )


async def run_research_pipeline(topic: str) -> AsyncIterator[ServerSentEvent]:
    """Runs the 4-step pipeline and yields an SSE event when each step starts/finishes."""
    current: StepName = "search"
    try:
        # step 1 - search agent
        current = "search"
        yield _step("search", "running")
        search_agent = build_search_agent()
        search_result = await search_agent.ainvoke({
            "messages": [("user", f"Find recent, reliable and detailed information about: {topic}")]
        })
        search_results = _as_text(search_result["messages"][-1].content)
        yield _step("search", "done", search_results)

        # step 2 - reader agent
        current = "reader"
        yield _step("reader", "running")
        reader_agent = build_reader_agent()
        reader_result = await reader_agent.ainvoke({
            "messages": [("user",
                f"Based on the following search results about '{topic}', "
                f"pick the most relevant URL and scrape it for deeper content.\n\n"
                f"Search Results:\n{search_results[:800]}"
            )]
        })
        scraped_content = _as_text(reader_result["messages"][-1].content)
        yield _step("reader", "done", scraped_content)

        # step 3 - writer chain
        current = "writer"
        yield _step("writer", "running")
        research_combined = (
            f"SEARCH RESULTS : \n {search_results} \n\n"
            f"DETAILED SCRAPED CONTENT : \n {scraped_content}"
        )
        report = await writer_chain.ainvoke({
            "topic": topic,
            "research": research_combined,
        })
        yield _step("writer", "done", report)

        # step 4 - critic chain
        current = "critic"
        yield _step("critic", "running")
        feedback = await critic_chain.ainvoke({"report": report})
        yield _step("critic", "done", feedback)

        yield ServerSentEvent(
            event="complete",
            data=CompleteEvent(
                topic=topic,
                search=search_results,
                reader=scraped_content,
                report=report,
                critic=feedback,
            ),
        )
    except Exception:
        logger.exception("Research pipeline failed at step '%s'", current)
        yield ServerSentEvent(
            event="error",
            data=ErrorEvent(
                step=current,
                message="The research pipeline failed. Please try again.",
            ),
        )


# yield provides a value to the caller, 
# temporarily pauses the function's execution, 
# and saves its local state so it can resume right where it left off on the next call.
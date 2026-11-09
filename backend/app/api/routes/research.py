from collections.abc import AsyncIterator

from fastapi import APIRouter
from fastapi.sse import EventSourceResponse, ServerSentEvent

from app.schemas.research import ResearchRequest
from app.services.research_service import run_research_pipeline

router = APIRouter(prefix="/research", tags=["research"])


@router.post("", response_class=EventSourceResponse)
async def research(payload: ResearchRequest) -> AsyncIterator[ServerSentEvent]:
    """Run the multi-agent pipeline and stream progress as Server-Sent Events."""
    async for event in run_research_pipeline(payload.topic):
        yield event

from typing import Literal
from pydantic import BaseModel, Field

StepName = Literal["search", "reader", "writer", "critic"]
StepStatus = Literal["running", "done"]


class ResearchRequest(BaseModel):
    """Request body for the research endpoint."""
    topic: str = Field(
        ...,
        min_length=3,
        max_length=200,
        description="The topic to research",
        examples=["Quantum computing breakthroughs in 2025"],
    )


class StepEvent(BaseModel):
    """Sent when a pipeline step starts (running) or finishes (done)."""
    step: StepName
    status: StepStatus
    output: str | None = None  # only present when status == "done"


class CompleteEvent(BaseModel):
    """Sent once, after all four steps have finished."""
    topic: str
    search: str
    reader: str
    report: str
    critic: str


class ErrorEvent(BaseModel):
    """Sent if an error occurs during any step."""
    step: StepName | None = None
    message: str

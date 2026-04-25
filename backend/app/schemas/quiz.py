from pydantic import BaseModel
from typing import Dict

class ExplanationRequest(BaseModel):
    question: str
    options: Dict[str, str]
    answer: str

class ExplanationResponse(BaseModel):
    explanation: str

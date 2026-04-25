from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, Depends
from app.services.quiz_service import quiz_service
from app.api import deps
from app.schemas.quiz import ExplanationRequest, ExplanationResponse

router = APIRouter()

@router.post("/explain", response_model=ExplanationResponse)
async def explain_question(request: ExplanationRequest):
    """
    AI-assisted explanation for a specific question.
    """
    explanation = quiz_service.get_explanation(request.question, request.options, request.answer)
    return {"explanation": explanation}

@router.post("/upload-and-generate")
async def upload_and_generate(
    files_English: List[UploadFile] = File(None),
    files_Aptitude: List[UploadFile] = File(None),
    files_Reasoning: List[UploadFile] = File(None),
    files_Odia: List[UploadFile] = File(None),
    files_CurrentAffairs: List[UploadFile] = File(None),
    files_Computer: List[UploadFile] = File(None),
    files_GeneralKnowledge: List[UploadFile] = File(None),
    files_Mixed: List[UploadFile] = File(None),
    text_English: str = Form(""),
    text_Aptitude: str = Form(""),
    text_Reasoning: str = Form(""),
    text_Odia: str = Form(""),
    text_CurrentAffairs: str = Form(""),
    text_Computer: str = Form(""),
    text_GeneralKnowledge: str = Form(""),
    text_Mixed: str = Form(""),
    config_English: int = Form(0),
    config_Aptitude: int = Form(0),
    config_Reasoning: int = Form(0),
    config_Odia: int = Form(0),
    config_CurrentAffairs: int = Form(0),
    config_Computer: int = Form(0),
    config_GeneralKnowledge: int = Form(0),
    config_Mixed: int = Form(0),
    total_questions: int = Form(10),
    marks_per_question: float = Form(1.0),
    negative_marks: float = Form(0.0),
    duration_minutes: int = Form(10),
    # Use auto_error=False to allow demo mode through this route
    current_user: Optional[dict] = Depends(deps.get_current_user)
):
    """
    Main entry point for quiz generation.
    Line-by-line:
    1. Aggregates all uploaded files and pasted texts.
    2. Maps category configuration counts.
    3. Delegates business logic to QuizService.
    """
    
    file_mapping = {
        "English": files_English, "Aptitude": files_Aptitude, "Reasoning": files_Reasoning,
        "Odia": files_Odia, "Current Affairs": files_CurrentAffairs, "Computer": files_Computer,
        "General Knowledge": files_GeneralKnowledge, "Mixed": files_Mixed
    }
    
    text_mapping = {
        "English": text_English, "Aptitude": text_Aptitude, "Reasoning": text_Reasoning,
        "Odia": text_Odia, "Current Affairs": text_CurrentAffairs, "Computer": text_Computer,
        "General Knowledge": text_GeneralKnowledge, "Mixed": text_Mixed
    }
    
    config_mapping = {
        "English": config_English, "Aptitude": config_Aptitude, "Reasoning": config_Reasoning,
        "Odia": config_Odia, "Current Affairs": config_CurrentAffairs, "Computer": config_Computer,
        "General Knowledge": config_GeneralKnowledge, "Mixed": config_Mixed
    }
    
    general_config = {
        "total_questions": total_questions,
        "marks_per_question": marks_per_question,
        "negative_marks": negative_marks,
        "duration_minutes": duration_minutes
    }

    # Execute service logic
    return quiz_service.generate_quiz(file_mapping, text_mapping, config_mapping, general_config)

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import random
import uuid
import json
from typing import List, Dict, Optional
from pdf_parser import extract_questions_from_pdf, extract_questions_from_text

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

CATEGORIES = [
    "English", "Aptitude", "Reasoning", "Odia", 
    "Current Affairs", "Computer", "General Knowledge", "Mixed"
]

@app.post("/api/upload-and-generate")
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
    duration_minutes: int = Form(10)
):
    all_selected_questions = []
    
    file_mapping = {
        "English": files_English,
        "Aptitude": files_Aptitude,
        "Reasoning": files_Reasoning,
        "Odia": files_Odia,
        "Current Affairs": files_CurrentAffairs,
        "Computer": files_Computer,
        "General Knowledge": files_GeneralKnowledge,
        "Mixed": files_Mixed,
    }
    
    text_mapping = {
        "English": text_English,
        "Aptitude": text_Aptitude,
        "Reasoning": text_Reasoning,
        "Odia": text_Odia,
        "Current Affairs": text_CurrentAffairs,
        "Computer": text_Computer,
        "General Knowledge": text_GeneralKnowledge,
        "Mixed": text_Mixed,
    }
    
    config_mapping = {
        "English": config_English,
        "Aptitude": config_Aptitude,
        "Reasoning": config_Reasoning,
        "Odia": config_Odia,
        "Current Affairs": config_CurrentAffairs,
        "Computer": config_Computer,
        "General Knowledge": config_GeneralKnowledge,
        "Mixed": config_Mixed,
    }
    
    session_id = str(uuid.uuid4())
    session_dir = os.path.join(UPLOAD_DIR, session_id)
    os.makedirs(session_dir, exist_ok=True)
    
    for category in CATEGORIES:
        category_questions = []
        
        # 1. Extract from PDFs
        files = file_mapping.get(category)
        if files:
            for file in files:
                file_path = os.path.join(session_dir, file.filename)
                with open(file_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                
                extracted = extract_questions_from_pdf(file_path)
                category_questions.extend(extracted)
        
        # 2. Extract from pasted text
        pasted_text = text_mapping.get(category, "")
        if pasted_text:
            extracted_text = extract_questions_from_text(pasted_text)
            category_questions.extend(extracted_text)
            
        # Pick requested number from this category
        num_to_pick = config_mapping.get(category, 0)
        if category_questions and num_to_pick > 0:
            selected = random.sample(
                category_questions, 
                min(len(category_questions), num_to_pick)
            )
            # Add category info to each question
            for q in selected:
                q["category"] = category
            all_selected_questions.extend(selected)

    # Shuffling all selected questions
    random.shuffle(all_selected_questions)
    
    # Trim to total_questions if needed
    final_questions = all_selected_questions[:total_questions]
    
    # Cleanup temp session files
    shutil.rmtree(session_dir, ignore_errors=True)
    
    return {
        "questions": final_questions,
        "config": {
            "total_questions": total_questions,
            "marks_per_question": marks_per_question,
            "negative_marks": negative_marks,
            "duration_minutes": duration_minutes
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

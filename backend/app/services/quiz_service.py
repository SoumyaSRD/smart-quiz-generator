import os
import uuid
import shutil
import random
from typing import List, Dict, Any
from app.core.config import settings
from pdf_parser import extract_questions_from_pdf, extract_questions_from_text

class QuizService:
    """
    Enterprise-level Service for Quiz Generation.
    Separates HTTP handling from the actual business logic of file parsing and randomization.
    """

    CATEGORIES = [
        "English", "Aptitude", "Reasoning", "Odia", 
        "Current Affairs", "Computer", "General Knowledge", "Mixed"
    ]

    @staticmethod
    def get_explanation(question: str, options: Dict[str, str], answer: str) -> str:
        """
        Generates a simulated AI explanation.
        In a real production environment, this would call OpenAI/Gemini API.
        """
        correct_text = options.get(answer, "")
        
        # Simulated intelligent analysis
        explanations = [
            f"According to the core principles of this subject, the correct answer is '{correct_text}' because it accurately addresses the primary requirement of the question. Other options fail to provide the same level of conceptual alignment.",
            f"Analysis of the question parameters reveals that '{correct_text}' (Option {answer}) is the only logically consistent choice. In this context, the other possibilities are either incomplete or factually secondary to the primary point.",
            f"The system has identified '{correct_text}' as the definitive answer. This is validated by standard protocols where {question[:30]}... requires a precise identification of the underlying theory or fact represented by Option {answer}.",
            f"Deep analysis indicates that '{correct_text}' is the correct response. This aligns with the expected outcomes for questions involving {question.split()[0] if question else 'this topic'}, where Option {answer} provides the most comprehensive and accurate resolution."
        ]
        
        return random.choice(explanations)

    @staticmethod
    def generate_quiz(
        file_mapping: Dict[str, List[Any]],
        text_mapping: Dict[str, str],
        config_mapping: Dict[str, int],
        general_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Main logic for generating a quiz from multiple sources.
        """
        all_selected_questions = []
        
        # 1. Create a unique session directory to avoid file collisions
        session_id = str(uuid.uuid4())
        session_dir = os.path.join(settings.UPLOAD_DIR, session_id)
        os.makedirs(session_dir, exist_ok=True)
        
        try:
            for category in QuizService.CATEGORIES:
                category_questions = []
                
                # 2. Extract from PDFs
                files = file_mapping.get(category)
                if files:
                    for file in files:
                        file_path = os.path.join(session_dir, file.filename)
                        # Save uploaded file chunk by chunk for memory efficiency
                        with open(file_path, "wb") as buffer:
                            shutil.copyfileobj(file.file, buffer)
                        
                        # Call parser utility
                        extracted = extract_questions_from_pdf(file_path)
                        category_questions.extend(extracted)
                
                # 3. Extract from pasted text
                pasted_text = text_mapping.get(category, "")
                if pasted_text:
                    extracted_text = extract_questions_from_text(pasted_text)
                    category_questions.extend(extracted_text)
                    
                # 4. Randomized Selection
                # logic: Pick requested number from this category specifically
                num_to_pick = config_mapping.get(category, 0)
                if category_questions and num_to_pick > 0:
                    selected = random.sample(
                        category_questions, 
                        min(len(category_questions), num_to_pick)
                    )
                    # Label the category for frontend results review
                    for q in selected:
                        q["category"] = category
                    all_selected_questions.extend(selected)

            # 5. Final Shuffle and Limit
            # Ensure the order isn't predictable if categories were added sequentially
            random.shuffle(all_selected_questions)
            final_questions = all_selected_questions[:general_config.get("total_questions", 10)]
            
            return {
                "questions": final_questions,
                "config": general_config
            }
        finally:
            # 6. Cleanup: Remove temporary files immediately after processing
            shutil.rmtree(session_dir, ignore_errors=True)

quiz_service = QuizService()

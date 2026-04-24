import pdfplumber
import re
import random

# Regex to match:
# 1. Question text
# A) Option A
# B) Option B
# C) Option C
# D) Option D
# Answer: C
QUESTION_PATTERN = re.compile(
    r"(?P<id>\d+)\.\s*(?P<question>.*?)\s*"
    r"A\)\s*(?P<option_a>.*?)\s*"
    r"B\)\s*(?P<option_b>.*?)\s*"
    r"C\)\s*(?P<option_c>.*?)\s*"
    r"D\)\s*(?P<option_d>.*?)\s*"
    r"Answer:\s*(?P<answer>[A-D])",
    re.DOTALL | re.IGNORECASE
)

def extract_questions_from_pdf(file_path):
    questions = []
    try:
        with pdfplumber.open(file_path) as pdf:
            full_text = ""
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    full_text += text + "\n"
            
            questions = extract_questions_from_text(full_text)
    except Exception as e:
        print(f"Error parsing PDF {file_path}: {e}")
    
    return questions

def extract_questions_from_text(text):
    questions = []
    if not text:
        return []
        
    matches = QUESTION_PATTERN.finditer(text)
    for match in matches:
        questions.append({
            "id": match.group("id"),
            "question": match.group("question").strip(),
            "options": {
                "A": match.group("option_a").strip(),
                "B": match.group("option_b").strip(),
                "C": match.group("option_c").strip(),
                "D": match.group("option_d").strip(),
            },
            "answer": match.group("answer").strip().upper()
        })
    return questions

def select_random_questions(questions, count):
    if count <= 0:
        return []
    return random.sample(questions, min(len(questions), count))

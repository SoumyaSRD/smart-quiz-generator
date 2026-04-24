import pdfplumber
import re
import random

# Improved Regex to be more flexible with question and option markers
# It matches:
# [Number] (optional) [Question Text]
# A) or A. or (A) [Option A]
# B) or B. or (B) [Option B]
# C) or C. or (C) [Option C]
# D) or D. or (D) [Option D]
# Answer: [Letter]
QUESTION_PATTERN = re.compile(
    r"(?:(?P<id>\d+)\b[.)]?\s*)?"               # Optional ID like '1.' or '1)' or '1'
    r"(?P<question>.+?)"                         # Question text (non-greedy)
    r"\s*(?:\(?A[.)]|\(A\))\s*(?P<option_a>.+?)" # Matches A) or A. or (A)
    r"\s*(?:\(?B[.)]|\(B\))\s*(?P<option_b>.+?)"
    r"\s*(?:\(?C[.)]|\(C\))\s*(?P<option_c>.+?)"
    r"\s*(?:\(?D[.)]|\(D\))\s*(?P<option_d>.+?)"
    r"\s*Answer:\s*(?P<answer>[A-D])",
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
            
            # Clean up the text a bit
            full_text = full_text.replace('\r', '')
            questions = extract_questions_from_text(full_text)
    except Exception as e:
        print(f"Error parsing PDF {file_path}: {e}")
    
    return questions

def extract_questions_from_text(text):
    questions = []
    if not text:
        return []
    
    # Pre-processing: remove carriage returns and normalize whitespace slightly
    text = text.replace('\r', '')
    
    matches = list(QUESTION_PATTERN.finditer(text))
    
    for i, match in enumerate(matches, 1):
        raw_id = match.group("id")
        q_id = raw_id if raw_id else str(i)
        
        # Clean the extracted text parts
        question_text = match.group("question").strip()
        # If there's a newline at the start of the question text (common with finditer), remove it
        question_text = re.sub(r'^\s+', '', question_text)
        
        questions.append({
            "id": q_id,
            "question": question_text,
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

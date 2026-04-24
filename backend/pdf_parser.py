import pdfplumber
import re
import random

def extract_questions_from_pdf(file_path):
    try:
        with pdfplumber.open(file_path) as pdf:
            full_text = "\n".join([p.extract_text() or "" for p in pdf.pages])
            return extract_questions_from_text(full_text)
    except Exception as e:
        print(f"Error parsing PDF {file_path}: {e}")
    return []

def extract_questions_from_text(text):
    if not text:
        return []

    # 1. Normalize text: remove \r, collapse multiple spaces, handle weird newlines
    text = text.replace('\r', '')
    
    # 2. Use a Global Regex that finds the whole block: [Question] [Options] [Answer]
    # This regex looks for:
    # - A question (anything until it sees 'A)' or 'A.')
    # - Option A, B, C, D in sequence
    # - An Answer line
    PATTERN = re.compile(
        r"(?P<question>(?:(?!\b[A-D][.)]).)+)\s*"          # Question text
        r"(?:\(?A[.)]|\(A\)|\[A\])\s*(?P<opt_a>.*?)\s*"    # Option A
        r"(?:\(?B[.)]|\(B\)|\[B\])\s*(?P<opt_b>.*?)\s*"    # Option B
        r"(?:\(?C[.)]|\(C\)|\[C\])\s*(?P<opt_c>.*?)\s*"    # Option C
        r"(?:\(?D[.)]|\(D\)|\[D\])\s*(?P<opt_d>.*?)\s*"    # Option D
        r"Answer:\s*(?P<answer>[A-D])",                    # Answer
        re.DOTALL | re.IGNORECASE
    )

    questions = []
    matches = list(PATTERN.finditer(text))
    
    for i, match in enumerate(matches, 1):
        q_text = match.group("question").strip()
        
        # Cleanup: Remove leading numbers like "1. ", "2) " from the question text
        q_text = re.sub(r'^\d+\b[.)]?\s*', '', q_text)
        # Cleanup: If it's multi-line, collapse newlines into spaces
        q_text = " ".join(q_text.split())

        questions.append({
            "id": str(i),
            "question": q_text,
            "options": {
                "A": match.group("opt_a").strip(),
                "B": match.group("opt_b").strip(),
                "C": match.group("opt_c").strip(),
                "D": match.group("opt_d").strip(),
            },
            "answer": match.group("answer").strip().upper()
        })

    print(f"DEBUG: Extracted {len(questions)} questions from text input.")
    return questions

def select_random_questions(questions, count):
    if not questions:
        return []
    # Fallback: if count is 0 but we have questions, pick all (up to 50) 
    # to avoid "No questions" error if user forgot to set count
    if count <= 0:
        return random.sample(questions, min(len(questions), 10))
        
    return random.sample(questions, min(len(questions), count))

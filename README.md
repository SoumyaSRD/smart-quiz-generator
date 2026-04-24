# Quiz Generator Setup Instructions

This project consists of a **FastAPI backend** and a **React (Vite) frontend**.

## 🚀 Backend Setup (Python)

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (optional but recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the FastAPI server:**
   ```bash
   python main.py
   ```
   The backend will start at `http://localhost:8000`.

---

## 💻 Frontend Setup (React)

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   The frontend will start at `http://localhost:5173`.

---

## 📄 Sample PDF Format

To ensure the parser extracts questions correctly, your PDFs should follow this format:

```text
1. What is the capital of France?
A) London
B) Berlin
C) Paris
D) Madrid
Answer: C

2. Which planet is known as the Red Planet?
A) Venus
B) Mars
C) Jupiter
D) Saturn
Answer: B
```

---

## 🧪 Example Extracted JSON (API Response)

```json
{
  "questions": [
    {
      "id": "1",
      "question": "What is the capital of France?",
      "options": {
        "A": "London",
        "B": "Berlin",
        "C": "Paris",
        "D": "Madrid"
      },
      "answer": "C",
      "category": "General Knowledge"
    }
  ],
  "config": {
    "total_questions": 10,
    "marks_per_question": 1.0,
    "negative_marks": 0.0,
    "duration_minutes": 10
  }
}
```

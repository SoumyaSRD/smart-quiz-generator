# 🧠 BrainWave: Enterprise Quiz Generator Pro

A professional, high-performance Full-Stack MCQ Generator system built with **React 19**, **FastAPI**, and **TypeScript**. Generate intelligent quizzes from PDFs or raw text with advanced AI-simulated explanations.

---

## 🚀 Key Features

- **Multi-Source Ingestion**: Categorize inputs into English, Aptitude, Reasoning, Odia, General Knowledge, and more.
- **Intelligent Parsing**: Robust State-Machine parser handles messy PDF text, missing numbers, and inconsistent formatting.
- **Dynamic Theming**: 10+ premium themes including **Solo Leveling**, **The Batman**, and **One Piece**.
- **Result Analytics**: Instant evaluation with downloadable PDF Answer Keys and Performance Reports.
- **Enterprise Ready**: Fully Dockerized, Type-safe, and supports Internationalization (i18n).

---

## 🛠️ Technical Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, TypeScript, Zustand, Tailwind CSS, Sass |
| **Backend** | FastAPI (Python 3.11), pdfplumber, Pydantic |
| **DevOps** | Docker, Nginx, GitHub Actions (CI/CD) |
| **Utilities** | jsPDF, i18next, Lucide Icons |

---

## 🏗️ Local Development Setup

### Prerequisites
- **Node.js**: v22 or higher
- **Python**: v3.11 or higher
- **Docker**: Optional (for containerized setup)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
*The backend will run on `http://localhost:8000`*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on `http://localhost:5173`*

### 3. Using Docker (Recommended)
```bash
# Runs both services with live-reload (Development)
docker compose up --build
```

---

## 🌐 Deployment Guide (Production)

### Backend (Render / Heroku)
1. **Root Directory**: `backend`
2. **Build Command**: `pip install -r requirements.txt`
3. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Env Vars**:
   - `ALLOWED_ORIGINS`: `https://your-frontend.github.io`
   - `SECRET_KEY`: (Your secret string for JWT)

### Frontend (GitHub Pages)
1. Set up GitHub Secret `VITE_API_URL` pointing to your Render backend.
2. The provided GitHub Action (`.github/workflows/deploy-frontend.yml`) will build and deploy to the `gh-pages` branch.
3. In Repo Settings > Pages, select `gh-pages` as the source branch.

---

## ⚙️ Configuration (Environment Variables)

### Backend (`backend/.env`)
- `PORT`: Default `8000`
- `ALLOWED_ORIGINS`: Comma-separated list of allowed URLs for CORS.
- `SECRET_KEY`: Used for JWT authentication.

### Frontend (`frontend/.env`)
- `VITE_API_URL`: Full URL of the backend API (e.g., `https://api.yourdomain.com`).

---

## 📝 MCQ Standard Format
For best results, use the following structure:
```text
1. What is the capital of France?
A) London
B) Berlin
C) Paris
D) Madrid
Answer: C
```
*Note: The system automatically normalizes spacing and removes leading numbers.*

---

## 🛠️ Troubleshooting & Recent Fixes

- **Bcrypt Compatibility**: Fixed `ValueError` in production by pinning `bcrypt==4.0.1`.
- **Deployment Connectivity**: Updated `apiClient` to prevent falling back to `localhost` in production environments.
- **Dynamic Routing**: Added automatic base-path detection for GitHub Pages vs. Custom Domains.
- **Port Binding**: Added dynamic `$PORT` binding for compatibility with Render/Heroku environments.

---

## 🤝 Contributing
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---
*Developed with 🧠 by the BrainWave Engineering Team.*

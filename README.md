# 🧠 Enterprise Quiz Generator Pro

A professional, high-performance Full-Stack MCQ Generator system built with **React (TypeScript)**, **Zustand**, **Sass**, and **FastAPI**.

## 🚀 Key Features

- **Multi-Source Input**: Upload multiple PDF files or paste raw text categorized into 7+ subjects.
- **Enterprise Architecture**: 
  - **State Management**: Powered by **Zustand** with persistent storage middleware.
  - **Theming System**: Robust CSS-Variable driven architecture with **Sass** mixins.
  - **Type Safety**: 100% **TypeScript** coverage for frontend components and stores.
- **Dynamic Themes**: Switch between 10+ premium themes (Light, Dark, Solo Leveling, Batman, One Piece, and Nature Collection).
- **Intelligent Parser**: Robust Regex and State-Machine parsing to handle messy PDF extractions and unnumbered text blocks.
- **Auto-Formatter**: Built-in text utility to normalize spacing and handle "Answer: X" lines automatically.
- **Multi-Lingual**: Full i18n support for English, Hindi, Odia, French, and Spanish.

---

## 🛠️ Technical Stack

### Frontend
- **Framework**: React 18 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Sass (SCSS)
- **State**: Zustand (Middleware: Persist)
- **Internationalization**: react-i18next
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Parser**: pdfplumber + Advanced Regex
- **Deployment**: Dockerized (Dev/Prod stages)

---

## 🏗️ Getting Started

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Docker (Recommended)
```bash
docker compose up --build
```

---

## 📝 MCQ Standard Format
The system performs best with this structure:
```text
1. What is the capital of France?
A) London
B) Berlin
C) Paris
D) Madrid
Answer: C
```
*Note: The auto-formatter will handle missing numbers and inconsistent spacing automatically.*

---

## 🍱 Themes Available
- **Core**: Light, Dark
- **Anime**: Solo Leveling (Shadow Monarch), One Piece (Grand Line)
- **Nature**: Deep Sea, Green Hills, Cold Mountain, Blue River, Waterfall
- **Special**: The Batman (High Contrast Black/Yellow)

---

## 🌐 Deployment Guide (GitHub Pages + Render)

### 1. Backend (Render)
1. Create a new **Web Service** on Render.
2. Connect your repository.
3. Set **Root Directory** to `backend`.
4. Set **Environment Variables**:
   - `PORT`: `8000` (Render handles this, but you can specify).
   - `ALLOWED_ORIGINS`: `https://your-username.github.io` (Replace with your GitHub Pages URL).
   - `SECRET_KEY`: A long random string for JWT security.

### 2. Frontend (GitHub Pages)
1. Go to your GitHub Repository **Settings** > **Secrets and variables** > **Actions**.
2. Add a **New repository secret**:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-app.onrender.com` (Your Render backend URL).
3. The GitHub Action will automatically build and deploy the frontend to the `gh-pages` branch.
4. Ensure **Settings** > **Pages** is set to deploy from the `gh-pages` branch.

---
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/NewTheme`)
3. Commit changes (`git commit -m 'Add New Theme'`)
4. Push to the branch (`git push origin feature/NewTheme`)
5. Open a Pull Request

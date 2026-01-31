Here’s a **clean, professional, project-specific `README.md`** you can drop in directly.
No fluff. Clear scope. Ethically safe. Resume-ready.

---

````md
# Sentiment Insight Analyzer

A full-stack, multilingual sentiment analysis web application built as a hands-on exploration of **machine learning, natural language processing, and applied AI systems**.

The system analyzes user-provided text, detects emotional sentiment, assigns a severity level, and returns **structured, actionable guidance** along with **contextual YouTube recommendations**.

> ⚠️ This project is for educational and research purposes only. It does **not** replace professional medical or mental health advice.

---

## ✨ Features

### 🔤 Multilingual Support
- Automatic language detection
- Supports:
  - English, Hindi, Bengali, Marathi, Gujarati, Punjabi  
  - Tamil, Telugu, Kannada, Odia, Assamese
- Non-English inputs are translated to English for analysis and translated back for output

### 🧠 Sentiment & Severity Analysis
- Uses **zero-shot classification** (`facebook/bart-large-mnli`)
- Classifies emotional state into:
  - Positive / motivated
  - Low mood or fatigue
  - High emotional distress
- Derives **severity levels**:
  - Low
  - Mild
  - High  
  (model-driven, not keyword-based)

### 🧭 Structured Guidance (Roadmap)
- Severity-aware action steps
- Designed to be:
  - Non-generic
  - Clear
  - Ethically safe
- High-severity responses explicitly encourage seeking professional help

### 📺 YouTube Recommendations
- Dynamically generated based on severity
- Uses YouTube Data API
- Examples:
  - Grounding & breathing exercises (high)
  - Fatigue recovery & calm focus (mild)
  - Productivity & motivation (low)

### 🖥️ Modern Frontend
- React + Vite
- Clean, responsive UI
- Separate pages for:
  - Home (Analyzer)
  - About
  - Resources
  - Contact
- Active navigation highlighting
- Severity-based visual indicators

---

## 🏗️ Tech Stack

### Frontend
- React 18
- Vite
- React Router DOM
- CSS (custom, no UI framework)

### Backend
- FastAPI
- Hugging Face Transformers
- PyTorch
- LangID (language detection)
- YouTube Data API v3

---

## 🚀 Running the Project Locally

### 1️⃣ Clone the repository
```bash
git clone <your-repo-url>
cd sentiment-analysis-project
````

---

### 2️⃣ Backend Setup (FastAPI)

```bash
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file:

```env
YOUTUBE_API_KEY=your_api_key_here
```

Run the backend:

```bash
uvicorn api.main:app --reload
```

Backend runs at:

```
http://127.0.0.1:8000
```

---

### 3️⃣ Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## 🔌 API Endpoints

### `POST /analyze`

Analyzes a single text input.

**Request**

```json
{
  "text": "I feel overwhelmed and exhausted"
}
```

**Response**

```json
{
  "text": "...",
  "sentiment": "...",
  "confidence": 0.87,
  "severity": "Mild",
  "roadmap": [...],
  "youtube_recommendations": [...],
  "language": "en"
}
```

---

### `POST /analyze-batch`

Analyzes multiple inputs at once.

---

## 🧪 Edge Case Handling

The system safely handles:

* Empty or whitespace input
* Symbol-only input (e.g. `...`, `!!!`)
* Very short or ambiguous text
* Non-English scripts

No crashes. No undefined states.

---

## 📌 Ethical Disclaimer

This system:

* Provides **non-clinical, informational guidance only**
* Does **not** diagnose conditions
* Encourages professional help when high distress is detected

If you are experiencing severe emotional distress, please contact a qualified mental health professional or local emergency services.

---

## 👩‍💻 Author

Built by a student as a practical exploration of:

* Machine Learning
* NLP
* Full-stack AI systems

**GitHub:** [https://github.com/Rkncodes](https://github.com/Rkncodes)
**Contact:** [rajvinderkaurpersonal@email.com](mailto:rajvinderkaurpersonal@email.com)

---

## 📄 License

This project is intended for educational and research use.

```



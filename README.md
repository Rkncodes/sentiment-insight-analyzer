# Sentiment Insight Analyzer

A **multilingual sentiment analysis and guidance system** built as a hands-on exploration of  
**machine learning, natural language processing, and full-stack AI systems**.

The application allows users to express emotions in their **native language** and receive
**language-matched, structured, and actionable guidance**, along with **contextual YouTube recommendations**.

> ⚠️ This project is for **educational and research purposes only**.  
> It does **not** replace professional medical or mental health advice.

---

## Key Features

### Multilingual Input & Output
- Automatic language detection
- Supports:
  - English, Hindi, Bengali, Marathi, Gujarati, Punjabi
  - Tamil, Telugu, Kannada, Odia, Assamese
- Non-English input is translated to English for analysis
- All guidance is translated **back into the user’s original language**

---

### Sentiment & Severity Analysis
- Zero-shot sentiment classification using `facebook/bart-large-mnli`
- Emotional categories:
  - **Positive / motivated**
  - **Low mood or fatigue**
  - **High emotional distress**
- Severity levels:
  - Low
  - Mild
  - High  
- Severity is **model-driven**, not keyword-based

---

### Structured Guidance (Roadmap)
- Deterministic, rule-based action steps
- Tailored to severity level
- Designed to be:
  - Clear
  - Non-generic
  - Ethically safe
- High-severity cases encourage seeking professional help

---

### YouTube Recommendations
- Dynamically generated based on severity
- Powered by YouTube Data API
- Examples:
  - Grounding & breathing exercises (high)
  - Mental fatigue recovery (mild)
  - Motivation & productivity (low)

---

## 🏗️ Tech Stack

### Frontend
- React 18
- Vite
- React Router DOM
- Custom CSS (no UI framework)

### Backend
- FastAPI
- Hugging Face Transformers
- PyTorch
- LangID (language detection)
- YouTube Data API v3

---

## Project Structure

```

sentiment-analysis-project/
│
├── api/
│   └── main.py               # FastAPI backend
│
├── frontend/                 # React frontend
│
├── data/                     # Datasets (exploration only)
├── notebooks/                # Experiments
│
├── requirements.txt
├── .env
├── README.md
└── TEST_CASES.md

```

---

## Inference Pipeline

```

User Text
↓
Language Detection
↓
Translation → English
↓
Sentiment Classification
↓
Severity Mapping
↓
Roadmap Selection
↓
Translation → Original Language
↓
JSON Response

````

---

## Running the Project Locally

### Backend (FastAPI)

```bash
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
````

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

### Frontend (React + Vite)

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

## API Endpoints

### `POST /analyze`

Analyzes a single input.

```json
{
  "text": "ನಾನು ತುಂಬಾ ದಣಿದಿದ್ದೇನೆ"
}
```

### `POST /analyze-batch`

Analyzes multiple inputs in one request.

---

## Robust Input Handling

The system safely handles:

* Empty or whitespace input
* Symbol-only input (`...`, `!!!`)
* Very short or ambiguous text
* Non-English scripts

No crashes. No undefined states.

---

## Ethical Disclaimer

This system provides **non-clinical, informational guidance only**.
It does **not** diagnose conditions or replace professional care.

If you are experiencing severe emotional distress, please contact a qualified
mental health professional or local emergency services.

---

##  Author

Built by a student as a practical exploration of:

* Machine Learning
* NLP
* Full-stack AI systems

**GitHub:** [https://github.com/Rkncodes](https://github.com/Rkncodes)
**Contact:** [rajvinderkaurpersonal@email.com](mailto:rajvinderkaurpersonal@email.com)

---

##  License

This project is intended for educational and research use only.


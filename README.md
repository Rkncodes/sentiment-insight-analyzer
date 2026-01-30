# SENTIMENT ANALYSIS ML PROJECT

**Full Operational Context (Single Source of Truth)**

---

## 1. Project Purpose & Scope

### Purpose

This project is a **multilingual sentiment-analysis and guidance system** exposed via a **FastAPI backend**.

The system:

* Accepts **free-form user text** in multiple languages (English + Indian languages)
* Automatically detects the input language
* Translates non-English input into English
* Performs **sentiment classification** using a **zero-shot transformer model**
* Generates a **step-by-step, actionable roadmap**
* Translates the roadmap **back into the user’s original language**
* Returns a **structured JSON response** suitable for frontend consumption

**Core value:**
A user can express emotions in their **own language**, and the system responds **in the same language** with emotionally appropriate, actionable guidance.

---

### In Scope

* Multilingual text input (English, Hindi, Kannada, and other Indian languages)
* Sentiment classification (3 categories)
* Confidence and severity scoring
* Language-matched roadmap generation
* REST API using FastAPI
* Batch inference
* Backend-only (frontend planned)

---

### Explicitly Out of Scope (Current Phase)

* Model fine-tuning
* Clinical diagnosis or medical advice
* Crisis hotlines or emergency escalation
* User authentication
* Persistent user history
* Recommendation learning or personalization
* Mobile applications
* Deployment (Docker, CI/CD, cloud infrastructure)

---

### Non-Clinical Usage Disclaimer

This system provides **non-clinical, informational guidance only**.
It is **not intended for medical diagnosis, treatment, crisis intervention, or professional mental health advice**.

---

## 2. File & Folder Structure

```
sentiment-analysis-project/
│
├── api/
│   └── main.py               # FastAPI entry point
│
├── data/
│   ├── raw/
│   ├── processed/
│   ├── clinical_emotion_data.csv
│   └── patient_feedback.csv
│
├── frontend/                 # React frontend (WIP)
│
├── notebooks/                # EDA and experimentation
├── models/                   # Reserved (not used yet)
│
├── venv/                     # Python virtual environment
├── requirements.txt          # Locked dependencies
├── .env                      # Environment variables (gitignored)
├── README.md
├── TEST_CASES.md
└── annotation_notes.md
```

### Entry Points

* **Backend API:** `api/main.py`
* **Frontend:** `frontend/src/App.jsx` (in progress)
* **No training scripts** (pretrained models only)

---

## 3. Environment & Interpreter Setup (Critical)

* **Python version:** 3.11.x
  Verified with Python 3.11.9

* **Virtual environment:** `venv/`

### Activation (Windows)

```bat
cd C:\Projects\sentiment-analysis-project
venv\Scripts\activate
```

### Verify Interpreter (Non-Negotiable)

```bat
where python
```

Expected output:

```
...\sentiment-analysis-project\venv\Scripts\python.exe
```

If you see system Python, Anaconda, or Microsoft Store Python → **stop and fix interpreter selection**.

---

## 4. Dependency Management

Dependencies are locked via:

```
requirements.txt
```

Key libraries and rationale:

| Library              | Purpose                      |
| -------------------- | ---------------------------- |
| fastapi              | REST API framework           |
| uvicorn              | ASGI server                  |
| transformers==4.38.2 | Hugging Face models          |
| torch                | Model inference              |
| sentencepiece        | Required for NLLB tokenizer  |
| langid               | Language detection           |
| python-dotenv        | Environment variable loading |
| huggingface-hub      | Model downloads              |

⚠️ `transformers` **must remain pinned** to `4.38.2` (newer versions break NLLB tokenizers on Windows).

---

## 5. Data Pipeline

* No active training pipeline
* CSV datasets exist for exploration and possible future fine-tuning
* All inference uses **pretrained models only**

---

## 6. Model Architecture & Approach

### Architecture Overview

```
User Text
   ↓
Language Detection (langid)
   ↓
Translation → English (NLLB-200)
   ↓
Sentiment Classification (BART MNLI zero-shot)
   ↓
Rule-Based Roadmap Selection
   ↓
Translation → Original Language (NLLB-200)
   ↓
JSON Response
```

---

### Roadmap Generation Logic

Roadmap generation is **template-based and rule-driven**.

* A fixed set of predefined action steps is selected based on:

  * Predicted sentiment category
  * Derived severity level
* No generative text models are used
* After selection, roadmap steps are translated into the user’s original language

This keeps the system **deterministic, auditable, and extensible**.

---

### Sentiment Model

* **Model:** `facebook/bart-large-mnli`
* **Task:** Zero-shot classification
* **Labels:**

  * “Positive / motivated”
  * “Low mood or fatigue”
  * “High emotional distress”

#### Sentiment Interpretation Note

The classifier identifies the **dominant emotional state** by selecting the label with the highest model score.
Mixed or overlapping emotions are **not explicitly modeled**.

**Why zero-shot?**

* No labeled dataset required
* Flexible label design
* Stable multilingual behavior when paired with translation

---

### Translation Model

* **Model:** `facebook/nllb-200-distilled-600M`
* Loaded manually (not via pipeline)
* Supports 200+ languages
* Uses forced BOS tokens for target language selection

---

## 7. Training Workflow

❌ No training currently implemented.

This project intentionally avoids training complexity in its current phase.
Future work may include fine-tuning on curated emotional datasets.

---

## 8. Inference & API Usage

### Run Server

```bat
uvicorn api.main:app --host 127.0.0.1 --port 8000
```

---

### `/analyze` — Single Input

Request:

```json
{ "text": "ನಾನು ತುಂಬಾ ದಣಿದಿದ್ದೇನೆ" }
```

Response (example):

```json
{
  "sentiment": "Low mood or fatigue",
  "confidence": 0.855,
  "severity": "Mild",
  "roadmap": [...],
  "language": "kn"
}
```

---

### `/analyze-batch`

Supports batch sentiment analysis for multiple inputs.

---

## 9. Evaluation & Metrics

### Available Metrics

* **Confidence score:** normalized model likelihood (not calibrated probability)
* **Severity mapping:**

  * High emotional distress → High
  * Low mood or fatigue → Mild
  * Positive → Low

The confidence value reflects **relative model likelihood**, not statistical certainty.

No offline evaluation metrics are implemented yet.

---

## 10. Configuration & Constants

### Language Map

```python
LANG_MAP = {
    "en": "eng_Latn",
    "hi": "hin_Deva",
    "kn": "kan_Knda",
    "ta": "tam_Taml",
    "te": "tel_Telu",
    "bn": "ben_Beng",
    "mr": "mar_Deva",
    "gu": "guj_Gujr",
    "pa": "pan_Guru"
}
```

---

## 11. Known Pitfalls

* Upgrading `transformers` breaks tokenizers
* Translation pipelines are incompatible with NLLB
* Missing `sentencepiece` causes crashes
* Wrong Python interpreter leads to import failures

---

## 12. Current Project Status

### Fully Implemented

* Multilingual inference
* Language-matched output
* Batch processing
* Stable backend
* Windows compatibility

### Partially Implemented

* Frontend (React)
* Dataset usage

### Missing

* Frontend integration
* Video recommendation layer
* Persistent logs
* User sessions
* Deployment

### Performance Scope

Designed for **low-throughput academic and demo usage**.
Not optimized for high-QPS or production-scale deployment.

---

## 13. Next Steps

### Backend Enhancements

1. `/health` endpoint
2. Translation caching
3. Latency logging
4. Rate limiting
5. Language override support

### Optional Feature

**Sentiment-driven content suggestions** (e.g., curated YouTube links)

---

## Final Note

This document is **authoritative**.

If pasted into:

* ChatGPT Project Context
* README
* Documentation
* Notion

→ **No project state will be lost.**

---

### Ready Commands

* **“Frontend now”**
* **“Add YouTube recommendation layer”**
* **“Prepare demo / submission narrative”**

---


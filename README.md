# SENTIMENT ANALYSIS ML PROJECT

**Multilingual Sentiment Analysis & Guidance System**

---

## 1. Project Purpose

This project is a **multilingual sentiment analysis system** built using a **FastAPI backend**.

The system:

* Accepts **free-form text** in English and multiple Indian languages
* Automatically detects the input language
* Translates non-English input to English
* Performs **zero-shot sentiment classification**
* Assigns a **severity level**
* Generates a **step-by-step, actionable roadmap**
* Translates responses **back into the user’s original language**
* Returns a **structured JSON response** for frontend use

**Core idea:**
Users can express emotions in their **native language** and receive **language-matched, structured guidance**.

---

## 2. Scope

### In Scope

* Multilingual text input
* Automatic language detection
* Sentiment classification (3 categories)
* Severity scoring
* Actionable roadmap generation
* REST API (FastAPI)
* Batch inference

### Out of Scope (Current Phase)

* Medical diagnosis or therapy
* Emergency or crisis handling
* User accounts or persistence
* Model training or fine-tuning
* Deployment and scaling

---

### Non-Clinical Disclaimer

This system provides **informational, non-clinical guidance only**.
It does **not** replace professional medical or mental health advice.

---

## 3. Project Structure

```
sentiment-analysis-project/
│
├── api/
│   └── main.py               # FastAPI backend
│
├── frontend/                 # React frontend (WIP)
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

## 4. Inference Pipeline

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
```

---

## 5. API Usage

### Run the Server

```bash
uvicorn api.main:app --host 127.0.0.1 --port 8000
```

---

### `/analyze` — Single Input

**Request**

```json
{ "text": "ನಾನು ತುಂಬಾ ದಣಿದಿದ್ದೇನೆ" }
```

**Response (example)**

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

Accepts a list of texts and returns results for each input.

---

## 6. Model Overview

* **Sentiment Model:** `facebook/bart-large-mnli`

  * Zero-shot classification
  * Labels:

    * Positive / motivated
    * Low mood or fatigue
    * High emotional distress

* **Translation Model:** `facebook/nllb-200-distilled-600M`

  * Used for both input and output translation

* **Roadmap Generation:**

  * Rule-based, deterministic
  * Selected based on severity level
  * Translated to the user’s language

---

## Final Note

This repository represents a **stable backend system** suitable for:

* Academic submissions
* ML/NLP demos
* Portfolio projects

The design prioritizes **clarity, multilingual support, and deterministic behavior** over complexity.


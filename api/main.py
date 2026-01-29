from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from transformers import pipeline

# =======================
# App setup
# =======================
app = FastAPI(
    title="Sentiment Analysis API",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =======================
# Zero-shot sentiment model
# =======================
classifier = pipeline(
    task="zero-shot-classification",
    model="facebook/bart-large-mnli",  # STABLE on Windows
    device=-1
)

# SENTIMENT LABELS (LOCKED)
LABELS = [
    "High emotional distress",
    "Moderate negative sentiment",
    "Low mood or fatigue",
    "Neutral sentiment",
    "Positive / motivated"
]

# SENTIMENT SEVERITY MAP
SEVERITY_MAP = {
    "High emotional distress": "High",
    "Moderate negative sentiment": "Mild",
    "Low mood or fatigue": "Mild",
    "Neutral sentiment": "Low",
    "Positive / motivated": "Low"
}

# =======================
# Schemas
# =======================
class TextInput(BaseModel):
    text: str

class BatchTextInput(BaseModel):
    texts: List[str]

# =======================
# Core sentiment logic
# =======================
def analyze_sentiment(text: str) -> dict:
    result = classifier(
        text,
        LABELS,
        multi_label=False
    )

    label = result["labels"][0]
    confidence = round(result["scores"][0], 3)

    return {
        "text": text,
        "sentiment": label,
        "confidence": confidence,
        "severity": SEVERITY_MAP[label]
    }

# =======================
# Endpoints
# =======================
@app.get("/")
def health_check():
    return {"status": "Sentiment API running"}

@app.post("/analyze")
def analyze_single(input: TextInput):
    if not input.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    return analyze_sentiment(input.text)

@app.post("/analyze-batch")
def analyze_batch(input: BatchTextInput):
    if not input.texts:
        raise HTTPException(status_code=400, detail="Input list cannot be empty")

    if len(input.texts) > 20:
        raise HTTPException(status_code=400, detail="Maximum 20 texts allowed")

    results = [
        analyze_sentiment(text)
        for text in input.texts
        if text.strip()
    ]

    return {"results": results}

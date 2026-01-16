from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from pathlib import Path
import torch
from transformers import (
    DistilBertTokenizerFast,
    DistilBertForSequenceClassification
)

# =======================
# Model loading
# =======================
BASE_DIR = Path(__file__).parent.parent
MODEL_DIR = BASE_DIR / "model" / "transformer_model"

tokenizer = DistilBertTokenizerFast.from_pretrained(MODEL_DIR)
model = DistilBertForSequenceClassification.from_pretrained(MODEL_DIR)
model.eval()

# =======================
# FastAPI app
# =======================
app = FastAPI(
    title="Clinical Sentiment Risk Scoring API",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =======================
# Schemas
# =======================
class TextInput(BaseModel):
    text: str

class BatchTextInput(BaseModel):
    texts: List[str]

class RiskResponse(BaseModel):
    risk_score: float
    risk_level: str
    confidence: str
    recommendation: str

class BatchRiskItem(BaseModel):
    text: str
    risk_score: float
    risk_level: str
    confidence: str
    recommendation: str

# =======================
# Semantic safety buckets
# =======================
DISTRESS_BUCKETS = {
    "self_harm": [
        "end my life", "want to die", "kill myself",
        "take my life", "better off dead", "lost my will to live"
    ],
    "existential": [
        "nothing matters", "no point", "meaningless",
        "empty inside", "feel empty"
    ],
    "fatigue": [
        "exhausted", "emotionally drained", "can't cope"
    ],
    "ambiguous": [
        "some days feel harder", "struggling lately",
        "not okay lately", "feels heavy",
        "hard to get through the day"
    ]
}

def semantic_risk(text: str) -> float:
    text = text.lower()
    score = 0.0

    for bucket, phrases in DISTRESS_BUCKETS.items():
        for phrase in phrases:
            if phrase in text:
                if bucket == "self_harm":
                    score = max(score, 0.6)
                elif bucket == "existential":
                    score = max(score, 0.25)
                elif bucket == "fatigue":
                    score = max(score, 0.15)
                elif bucket == "ambiguous":
                    score = max(score, 0.10)

    return score

# =======================
# Core inference logic
# =======================
def compute_risk_scores(texts: List[str]) -> List[dict]:
    inputs = tokenizer(
        texts,
        return_tensors="pt",
        padding=True,
        truncation=True,
        max_length=256
    )

    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=1)

    results = []

    for text, prob in zip(texts, probs):
        model_negative_prob = float(prob[0])
        semantic_score = semantic_risk(text)

        risk_score = round(max(model_negative_prob, semantic_score), 3)

        if risk_score >= 0.30:
            risk_level = "High Concern"
            recommendation = "Immediate human review"
            confidence = "high"
        elif risk_score >= 0.10:
            risk_level = "Uncertain"
            recommendation = "Flag for human review"
            confidence = "medium"
        else:
            risk_level = "Low Concern"
            recommendation = "Routine monitoring"
            confidence = "high"

        results.append({
            "text": text,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "confidence": confidence,
            "recommendation": recommendation
        })

    return results

# =======================
# Endpoints
# =======================
@app.post("/analyze", response_model=RiskResponse)
def analyze_single(input: TextInput):
    result = compute_risk_scores([input.text])[0]
    return result

@app.post("/analyze-batch")
def analyze_batch(input: BatchTextInput):
    if not input.texts:
        raise HTTPException(status_code=400, detail="Input list cannot be empty")

    if len(input.texts) > 20:
        raise HTTPException(status_code=400, detail="Maximum 20 texts allowed per request")

    results = compute_risk_scores(input.texts)
    return {"results": results}

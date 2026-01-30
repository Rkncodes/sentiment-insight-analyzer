from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import langid
import torch
from dotenv import load_dotenv
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM

# =========================
# ENV
# =========================

load_dotenv()

# =========================
# APP
# =========================

app = FastAPI(title="Sentiment Insight Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# DEVICE
# =========================

DEVICE = 0 if torch.cuda.is_available() else -1
MODEL_DEVICE = "cuda" if DEVICE == 0 else "cpu"

# =========================
# MODELS
# =========================

sentiment_classifier = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli",
    device=DEVICE
)

TRANSLATION_MODEL = "facebook/nllb-200-distilled-600M"

translator_tokenizer = AutoTokenizer.from_pretrained(TRANSLATION_MODEL)
translator_model = AutoModelForSeq2SeqLM.from_pretrained(
    TRANSLATION_MODEL
).to(MODEL_DEVICE)

# =========================
# CONSTANTS
# =========================

LABELS = [
    "Positive / motivated",
    "Low mood or fatigue",
    "High emotional distress"
]

LANG_MAP = {
    "en": "eng_Latn",
    "hi": "hin_Deva",
    "kn": "kan_Knda",
    "ta": "tam_Taml",
    "te": "tel_Telu",
    "bn": "ben_Beng",
    "mr": "mar_Deva",
    "gu": "guj_Gujr",
    "pa": "pan_Guru",
    "or": "ory_Orya",
    "as": "asm_Beng"
}

# =========================
# SCHEMAS
# =========================

class TextRequest(BaseModel):
    text: str

class BatchRequest(BaseModel):
    texts: List[str]

# =========================
# HELPERS
# =========================

def detect_language(text: str) -> str:
    code, _ = langid.classify(text)
    return code if code in LANG_MAP else "en"

def translate(text: str, src: str, tgt: str) -> str:
    if src == tgt:
        return text

    translator_tokenizer.src_lang = LANG_MAP[src]

    inputs = translator_tokenizer(
        text,
        return_tensors="pt",
        padding=True
    ).to(MODEL_DEVICE)

    forced_bos_token_id = translator_tokenizer.convert_tokens_to_ids(
        LANG_MAP[tgt]
    )

    with torch.no_grad():
        generated_tokens = translator_model.generate(
            **inputs,
            forced_bos_token_id=forced_bos_token_id,
            max_length=256
        )

    return translator_tokenizer.batch_decode(
        generated_tokens,
        skip_special_tokens=True
    )[0]

# =========================
# SEVERITY LOGIC (IMPORTANT)
# =========================

DANGER_KEYWORDS = [
    "kill myself",
    "end my life",
    "harm myself",
    "hurt myself",
    "no reason to live",
    "can't go on",
    "suicide"
]

def severity_from_sentiment(sentiment: str, confidence: float, text: str) -> str:
    text = text.lower()
    has_danger = any(k in text for k in DANGER_KEYWORDS)

    if (
        sentiment == "High emotional distress"
        and confidence >= 0.75
        and has_danger
    ):
        return "High"

    if sentiment in ["High emotional distress", "Low mood or fatigue"]:
        return "Mild"

    return "Low"

# =========================
# WORKFLOW GENERATION
# =========================

def generate_workflow(sentiment: str, severity: str):
    if severity == "High":
        return [
            {"text": "PAUSE NON-ESSENTIAL ACTIVITIES IMMEDIATELY.", "level": "critical"},
            {"text": "ENSURE YOU ARE IN A SAFE ENVIRONMENT.", "level": "critical"},
            {
                "text": "CONSULT A QUALIFIED MEDICAL OR MENTAL HEALTH PROFESSIONAL IMMEDIATELY.",
                "level": "critical"
            }
        ]

    if severity == "Mild":
        return [
            {
                "text": "Temporarily reduce cognitive and emotional load.",
                "level": "normal"
            },
            {
                "text": "Complete one low-effort task to regain a sense of control.",
                "level": "normal"
            },
            {
                "text": "Explicitly identify what is within your control today.",
                "level": "normal"
            },
            {
                "text": "Speak to someone you trust and can confide in.",
                "level": "supportive"
            }
        ]

    return [
        {
            "text": "Maintain current emotional balance without overextending.",
            "level": "normal"
        },
        {
            "text": "Channel motivation into one clearly defined short-term goal.",
            "level": "normal"
        }
    ]

# =========================
# ENDPOINTS
# =========================

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/analyze")
def analyze_text(req: TextRequest):
    original_text = req.text
    lang = detect_language(original_text)

    text_en = translate(original_text, lang, "en")

    result = sentiment_classifier(
        text_en,
        candidate_labels=LABELS
    )

    sentiment = result["labels"][0]
    confidence = round(float(result["scores"][0]), 3)
    severity = severity_from_sentiment(sentiment, confidence, text_en)

    workflow_en = generate_workflow(sentiment, severity)

    workflow_out = [
        {
            "text": translate(step["text"], "en", lang),
            "level": step["level"]
        }
        for step in workflow_en
    ]

    return {
        "text": original_text,
        "sentiment": sentiment,
        "confidence": confidence,
        "severity": severity,
        "roadmap": workflow_out,
        "language": lang
    }

@app.post("/analyze-batch")
def analyze_batch(req: BatchRequest):
    return {
        "results": [
            analyze_text(TextRequest(text=t))
            for t in req.texts
        ]
    }

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import langid
import torch
import os
import requests
from dotenv import load_dotenv
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM

# =========================
# ENV
# =========================

load_dotenv()
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

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
    "bn": "ben_Beng",
    "mr": "mar_Deva",
    "gu": "guj_Gujr",
    "pa": "pan_Guru",
    "ta": "tam_Taml",
    "te": "tel_Telu",
    "kn": "kan_Knda",
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
        tokens = translator_model.generate(
            **inputs,
            forced_bos_token_id=forced_bos_token_id,
            max_length=256
        )

    return translator_tokenizer.batch_decode(
        tokens,
        skip_special_tokens=True
    )[0]

# =========================
# SEVERITY (FIXED, MODEL-DRIVEN)
# =========================

def severity_from_result(result: dict) -> str:
    labels = result["labels"]
    scores = result["scores"]

    score_map = dict(zip(labels, scores))

    distress = score_map.get("High emotional distress", 0)
    fatigue = score_map.get("Low mood or fatigue", 0)
    positive = score_map.get("Positive / motivated", 0)

    # HIGH: distress dominates and positive is suppressed
    if distress > 0.45 and distress > fatigue and positive < 0.2:
        return "High"

    # MILD: fatigue or mixed emotional signal
    if fatigue > positive:
        return "Mild"

    return "Low"

# =========================
# ROADMAP (EXPANDED, NON-GENERIC)
# =========================

def generate_roadmap(severity: str):
    if severity == "High":
        return [
            {"text": "PAUSE NON-ESSENTIAL ACTIVITIES IMMEDIATELY.", "level": "critical"},
            {"text": "ENSURE YOU ARE IN A SAFE, CALM ENVIRONMENT.", "level": "critical"},
            {"text": "SLOW YOUR BREATHING AND GROUND YOUR BODY.", "level": "critical"},
            {"text": "REACH OUT TO A TRUSTED PERSON RIGHT NOW.", "level": "critical"},
            {"text": "CONSULT A QUALIFIED MEDICAL OR MENTAL HEALTH PROFESSIONAL.", "level": "critical"}
        ]

    if severity == "Mild":
        return [
            {"text": "Reduce cognitive and emotional load temporarily.", "level": "normal"},
            {"text": "Complete one low-effort task to regain momentum.", "level": "normal"},
            {"text": "Identify what is within your control today.", "level": "normal"},
            {"text": "Take a short restorative break.", "level": "normal"},
            {"text": "Speak to someone you trust.", "level": "supportive"}
        ]

    return [
        {"text": "Maintain current emotional balance.", "level": "normal"},
        {"text": "Define one meaningful short-term goal.", "level": "normal"},
        {"text": "Allocate focused time blocks.", "level": "normal"},
        {"text": "Reflect briefly on what is working.", "level": "normal"},
        {"text": "Schedule a progress check in 5–7 days.", "level": "normal"}
    ]

# =========================
# YOUTUBE
# =========================

def yt_query_for_severity(severity: str):
    if severity == "High":
        return "grounding exercise emotional distress breathing"
    if severity == "Mild":
        return "mental fatigue recovery calm motivation"
    return "positive mindset productivity motivation"

def youtube_search(query: str, max_results=8):
    if not YOUTUBE_API_KEY:
        return []

    search_url = "https://www.googleapis.com/youtube/v3/search"
    search_params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": max_results,
        "key": YOUTUBE_API_KEY
    }

    search_res = requests.get(search_url, params=search_params).json()

    video_ids = [
        item["id"]["videoId"]
        for item in search_res.get("items", [])
        if "videoId" in item["id"]
    ]

    if not video_ids:
        return []

    stats_url = "https://www.googleapis.com/youtube/v3/videos"
    stats_params = {
        "part": "snippet,statistics",
        "id": ",".join(video_ids),
        "key": YOUTUBE_API_KEY
    }

    stats_res = requests.get(stats_url, params=stats_params).json()

    videos = []
    for item in stats_res.get("items", []):
        videos.append({
            "videoId": item["id"],
            "title": item["snippet"]["title"],
            "thumbnail": item["snippet"]["thumbnails"]["high"]["url"],
            "channel": item["snippet"]["channelTitle"],
            "published": item["snippet"]["publishedAt"][:10],
            "views": item["statistics"].get("viewCount", "0")
        })

    return videos

# =========================
# ENDPOINTS
# =========================

@app.post("/analyze")
def analyze_text(req: TextRequest):
    original = req.text
    lang = detect_language(original)
    text_en = translate(original, lang, "en")

    result = sentiment_classifier(
        text_en,
        candidate_labels=LABELS
    )

    sentiment = result["labels"][0]
    confidence = round(float(result["scores"][0]), 3)
    severity = severity_from_result(result)

    roadmap_en = generate_roadmap(severity)
    roadmap_out = [
        {"text": translate(step["text"], "en", lang), "level": step["level"]}
        for step in roadmap_en
    ]

    yt_results = youtube_search(
        yt_query_for_severity(severity),
        max_results=8
    )

    return {
        "text": original,
        "sentiment": sentiment,
        "confidence": confidence,
        "severity": severity,
        "roadmap": roadmap_out,
        "youtube_recommendations": yt_results,
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

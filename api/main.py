from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import langid
import torch
import os
import requests
import time 
import re
import torch.quantization
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer, util
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM


# =========================
# ENV
# =========================

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

print("YouTube key loaded:", bool(YOUTUBE_API_KEY))

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
    "text-classification",
    model="cardiffnlp/twitter-roberta-base-sentiment-latest",
    device=DEVICE
)

# Semantic similarity model (for crisis detection)
embedding_model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

TRANSLATION_MODEL = "facebook/nllb-200-distilled-600M"

translator_tokenizer = AutoTokenizer.from_pretrained(TRANSLATION_MODEL)
translator_model = AutoModelForSeq2SeqLM.from_pretrained(
    TRANSLATION_MODEL
).to(MODEL_DEVICE)

translator_model.eval()


translator_model = torch.quantization.quantize_dynamic(
    translator_model,
    {torch.nn.Linear},
    dtype=torch.qint8
)

torch.set_num_threads(8)

# =========================
# CONSTANTS
# =========================

LABELS = [
    "Positive / motivated",
    "Low mood or fatigue",
    "High emotional distress"
]


RISK_ANCHORS = [
"I want to die",
"I feel suicidal",
"I want to end my life",
"I don't want to live anymore",
"My life has no meaning",
"There is no point in living",
"I feel worthless",
"Everyone would be better off without me",
"The world would be better without me",
"I shouldn't exist",
"I want to disappear",
"I wish I wasn't here",
"I can't keep going",
"I just want everything to stop",
"Nothing will ever get better",
"I don't see a future for myself"
]

risk_anchor_embeddings = embedding_model.encode(
    RISK_ANCHORS,
    convert_to_tensor=True
)


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
    language: str | None = None

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

    # Safety guard
    if src not in LANG_MAP:
        src = "en"

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
            max_new_tokens=40,
            num_beams=1,
            do_sample=False
        )

    return translator_tokenizer.batch_decode(
        tokens,
        skip_special_tokens=True
    )[0]
# =========================
# INPUT VALIDATION (ADDED)
# =========================
import string

def is_meaningful_text(text: str) -> bool:
    if not text or not text.strip():
        return False

    stripped = text.strip()

    # Reject pure punctuation / symbols only
    if all(char in string.punctuation or char.isspace() for char in stripped):
        return False

    return True
# =========================
# SEVERITY (FIXED, MODEL-DRIVEN)
# =========================
RISK_PATTERNS = [

    r"no value",
    r"worthless",
    r"no meaning",
    r"life has no meaning",
    r"life is meaningless",

    r"no reason to live",
    r"tired of living",

    r"want to disappear",
    r"wish i could disappear",

    r"better off without me",
    r"better without me",
    r"people would be better off without me",

    r"if i wasn't here",
    r"if i was not here",
    r"if i weren't here",

    r"better if i wasn't here",
    r"better if i was not here",

    r"shouldn't exist",
    r"should not exist",

    r"don't deserve to live",

    r"life is pointless",
    r"everything is pointless",

    r"give up on life",
    r"can't go on",

]

DESPAIR_PATTERNS = [
    "no point",
    "no future",
    "can't keep going",
    "cannot keep going",
    "everything is pointless",
    "nothing matters",
    "nothing will get better",
    "i feel trapped",
    "i feel hopeless",
    "there is no way out"
]
def split_clauses(text):
    return re.split(r"[.,;!?]", text)

def severity_from_result(result: dict, text_en: str) -> str:

    clauses = split_clauses(text_en)

    for clause in clauses:
        clause_lower = clause.lower()

        for pattern in RISK_PATTERNS:
            if re.search(pattern, clause_lower):
                return "High"

        for phrase in DESPAIR_PATTERNS:
            if phrase in clause_lower:
                return "High"

    sentiment = result["labels"][0]
    score = result["scores"][0]

    text_lower = text_en.lower()

    # 1️⃣ Explicit suicide detection
    for pattern in RISK_PATTERNS:
        if re.search(pattern, text_lower):
            return "High"

    # 2️⃣ Despair + negative mood
    for phrase in DESPAIR_PATTERNS:
        if phrase in text_lower and sentiment == "negative":
            return "High"

    # 3️⃣ Semantic similarity
    text_embedding = embedding_model.encode(text_en, convert_to_tensor=True)
    similarities = util.cos_sim(text_embedding, risk_anchor_embeddings)[0]

    if similarities.max() > 0.68:
        return "High"

    # 4️⃣ Negative mood
    if sentiment == "negative":
        return "Mild"

    return "Low"

# =========================
# ROADMAP
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

def youtube_search(query: str, max_results=8):

    if not YOUTUBE_API_KEY:
        print("No YouTube API key")
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

    print("YOUTUBE SEARCH RESPONSE:", search_res)

    video_ids = [
        item["id"]["videoId"]
        for item in search_res.get("items", [])
        if item.get("id", {}).get("videoId")
    ]

    if not video_ids:
        print("No videos found")
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
def translate_batch(texts, src, tgt):
    if src == tgt:
        return texts

    if src not in LANG_MAP:
        src = "en"

    translator_tokenizer.src_lang = LANG_MAP[src]

    inputs = translator_tokenizer(
        texts,
        return_tensors="pt",
        padding=True,
        truncation=True
    ).to(MODEL_DEVICE)

    forced_bos_token_id = translator_tokenizer.convert_tokens_to_ids(
        LANG_MAP[tgt]
    )

    with torch.no_grad():
        tokens = translator_model.generate(
            **inputs,
            forced_bos_token_id=forced_bos_token_id,
            max_new_tokens=40,
            num_beams=1,
            do_sample=False
        )

    return translator_tokenizer.batch_decode(
        tokens,
        skip_special_tokens=True
    )
def yt_query_for_severity(severity: str):
    if severity == "High":
        return "grounding exercise emotional distress breathing"
    if severity == "Mild":
        return "mental fatigue recovery calm motivation"
    return "positive mindset productivity motivation"


@app.post("/analyze")
def analyze_text(req: TextRequest):

    start_time = time.time()

    original = req.text



    if not is_meaningful_text(original):
        return {
            "error": "Input is too short or not meaningful for sentiment analysis."
        }

    lang = req.language if req.language and req.language != "auto" else detect_language(original)

    # Skip translation if already English
    text_en = original if lang == "en" else translate(original, lang, "en")

    raw = sentiment_classifier(text_en)[0]

    sentiment = raw["label"].lower()
    confidence = round(float(raw["score"]), 3)

    result = {
    "labels": [sentiment],
    "scores": [raw["score"]]
    }

    sentiment = result["labels"][0]
    severity = severity_from_result(result, text_en)

    print({
        "language": lang,
        "translated": text_en,
        "scores": dict(zip(result["labels"], result["scores"])),
        "severity": severity
    })

    roadmap_en = generate_roadmap(severity)

    roadmap_texts = [step["text"] for step in roadmap_en]

    if lang == "en":
     translated_steps = roadmap_texts
    else:
      translated_steps = translate_batch(roadmap_texts, "en", lang)
    roadmap_out = [
    {"text": translated_steps[i], "level": roadmap_en[i]["level"]}
    for i in range(len(roadmap_en))
]
    try:
     yt_results = youtube_search(
        yt_query_for_severity(severity),
        max_results=8
    ) 
    except:
     yt_results = []
     
    
    print("Request latency:", round(time.time() - start_time, 2), "seconds")

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

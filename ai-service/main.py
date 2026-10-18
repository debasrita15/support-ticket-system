import json
import os
import re
import logging
from typing import Optional
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq

# Load environment variables from .env file
load_dotenv()

# Set up logging so we can see what the AI service is doing in terminal
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-service")

# Initialize FastAPI app
app = FastAPI(title="AI Ticket Support Service")

# Allow requests from frontend (port 4200) and backend (port 8080)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Fetch Groq API Key from environment variable (never hardcoded)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Initialize Groq client if key is provided
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# Models to attempt in order of preference
MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "qwen/qwen3.8-27b"]

# Allowed categories and priorities
VALID_CATEGORIES = {"BILLING", "TECHNICAL", "ACCOUNT", "GENERAL"}
VALID_PRIORITIES = {"LOW", "MEDIUM", "HIGH"}

# Default fallback values in case Groq is unreachable, key is missing, or rate-limited
FALLBACK_CATEGORY = "GENERAL"
FALLBACK_PRIORITY = "MEDIUM"
FALLBACK_REPLY = (
    "Thank you for contacting support. We have received your request and our support team "
    "is reviewing the details. We will provide an update as soon as possible."
)

def clean_json_output(raw_text: str) -> dict:
    """Helper to extract JSON even if wrapped in markdown code blocks"""
    # Remove ```json ... ``` wrappers if model includes them
    cleaned = re.sub(r"^```(?:json)?\s*", "", raw_text.strip(), flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned.strip())
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        return json.loads(match.group(0))
    return json.loads(cleaned)

def call_groq_chat(messages, max_tokens=300, temperature=0.2):
    """Helper that queries Groq with automatic fallback across available models"""
    last_err = None
    for model_name in MODELS:
        try:
            return groq_client.chat.completions.create(
                model=model_name,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
        except Exception as e:
            last_err = e
            continue
    raise last_err or RuntimeError("No Groq model was able to respond.")

# --- Pydantic Request & Response Models ---

class ClassifyRequest(BaseModel):
    title: str
    description: str

class ClassifyResponse(BaseModel):
    category: str
    priority: str

class SuggestReplyRequest(BaseModel):
    title: str
    description: str
    category: Optional[str] = "GENERAL"

class SuggestReplyResponse(BaseModel):
    suggested_reply: str


# --- Endpoints ---

# Health check endpoint from Step 1
@app.get("/hello")
def hello():
    return {"message": "Hello from AI Service (FastAPI)!"}


# POST /classify: Takes title and description, returns category and priority
@app.post("/classify", response_model=ClassifyResponse)
def classify_ticket(request: ClassifyRequest):
    if not groq_client:
        logger.warning("GROQ_API_KEY not configured. Using fallback classification.")
        return ClassifyResponse(category=FALLBACK_CATEGORY, priority=FALLBACK_PRIORITY)

    try:
        system_prompt = (
            "You are an AI support ticket classifier.\n"
            "Analyze the ticket title and description.\n"
            "Classify into exactly one category: [BILLING, TECHNICAL, ACCOUNT, GENERAL].\n"
            "Assign exactly one priority: [LOW, MEDIUM, HIGH].\n"
            "Return ONLY a valid JSON object in this exact format:\n"
            '{"category": "CATEGORY_NAME", "priority": "PRIORITY_LEVEL"}'
        )

        user_content = f"Title: {request.title}\nDescription: {request.description}"

        response = call_groq_chat(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            max_tokens=150,
            temperature=0.1
        )

        raw_content = response.choices[0].message.content
        data = clean_json_output(raw_content)

        category = str(data.get("category", FALLBACK_CATEGORY)).upper().strip()
        priority = str(data.get("priority", FALLBACK_PRIORITY)).upper().strip()

        # Validate that model output matches our allowed values
        if category not in VALID_CATEGORIES:
            category = FALLBACK_CATEGORY
        if priority not in VALID_PRIORITIES:
            priority = FALLBACK_PRIORITY

        logger.info(f"Classified ticket as Category={category}, Priority={priority}")
        return ClassifyResponse(category=category, priority=priority)

    except Exception as e:
        # Rule: If the AI call fails, use category GENERAL and priority MEDIUM so the app never breaks
        logger.error(f"AI classification failed ({e}). Returning safe defaults.")
        return ClassifyResponse(category=FALLBACK_CATEGORY, priority=FALLBACK_PRIORITY)


# POST /suggest-reply: Returns a polite, professional reply suggestion for the admin
@app.post("/suggest-reply", response_model=SuggestReplyResponse)
def suggest_reply(request: SuggestReplyRequest):
    if not groq_client:
        logger.warning("GROQ_API_KEY not configured. Using fallback reply.")
        return SuggestReplyResponse(suggested_reply=FALLBACK_REPLY)

    try:
        system_prompt = (
            "You are a helpful and polite customer support agent.\n"
            "Write a clear, concise, professional suggested reply to the customer's support ticket.\n"
            "Acknowledge their problem, provide helpful troubleshooting or next steps, and maintain a friendly tone."
        )

        user_content = (
            f"Ticket Title: {request.title}\n"
            f"Category: {request.category}\n"
            f"Ticket Description: {request.description}"
        )

        response = call_groq_chat(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content}
            ],
            temperature=0.7,
            max_tokens=300
        )

        reply = response.choices[0].message.content.strip()
        logger.info("Generated suggested reply successfully")
        return SuggestReplyResponse(suggested_reply=reply)

    except Exception as e:
        logger.error(f"AI reply suggestion failed ({e}). Returning fallback reply.")
        return SuggestReplyResponse(suggested_reply=FALLBACK_REPLY)

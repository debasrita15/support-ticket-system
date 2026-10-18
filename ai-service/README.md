# 🤖 Support Ticket System - FastAPI AI Microservice

A dedicated AI inference microservice built with **Python 3.11** and **FastAPI**, integrating **Groq Cloud LLMs** (`qwen/qwen3.8-27b`, `llama-3.3-70b-versatile`).

---

## 🛠️ Tech Stack & Dependencies

- **Python 3.11**
- **FastAPI**: Asynchronous web framework for high-throughput API endpoints
- **Uvicorn**: ASGI server
- **Groq Python SDK**: Cloud LLM API client
- **python-dotenv**: Environment variable management
- **httpx 0.27.2**: Pinned HTTP client for Groq compatibility

---

## 🏃 Running Locally

```bash
# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file with your key:
# GROQ_API_KEY=gsk_...

# Start server
uvicorn main:app --reload --port 8000
```

- Port: `8000`
- Interactive API Docs (Swagger UI): `http://localhost:8000/docs`
- Health check: `GET http://localhost:8000/hello`

---

## 📡 Endpoints

### 1. `POST /classify`
- **Request:**
  ```json
  {
    "title": "Cannot login to VPN",
    "description": "Getting error 691 when attempting to authenticate"
  }
  ```
- **Response:**
  ```json
  {
    "category": "TECHNICAL",
    "priority": "HIGH"
  }
  ```

### 2. `POST /suggest-reply`
- **Request:**
  ```json
  {
    "title": "Cannot login to VPN",
    "description": "Getting error 691 when attempting to authenticate",
    "category": "TECHNICAL"
  }
  ```
- **Response:**
  ```json
  {
    "suggested_reply": "Dear Customer,\n\nThank you for reaching out regarding the VPN error 691..."
  }
  ```

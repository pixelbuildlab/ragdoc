from dotenv import load_dotenv
import os

load_dotenv()

QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_COLLECTION = "docs"
QDRANT_DIMS = 768
QDRANT_TOP_K = 5


OLLAMA_API_URL = os.getenv("OLLAMA_API_URL")
OLLAMA_EMBED_MODEL = "nomic-embed-text:latest"
# OLLAMA_EMBED_MODEL = "nomic-embed-text-v2-moe"
# bge-m3

OLLAMA_COMPLETION_MODEL = "qwen3:latest"
# llama:3b

CONFIDENT_THRESHOLD = 0.05

INNGEST_API_URL = os.getenv("INGGEST_API_URL")


DB_NAME = os.getenv("POSTGRES_DB")
DB_USER = os.getenv("POSTGRES_USER")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD")

# RagDoc

1. Setup and run locally
- Setup Ollama : `curl -fsSL https://ollama.com/install.sh | sh`
    - Pull one of both models, I preferred qwen3:latest and nomic-embed-text-v2-moe
    - llama:3b
    - qwen3:latest
    - nomic-embed-text-v2-moe or nomic-embed-text:latest 
- Setup Docker : `https://docs.docker.com/compose/install/`
- Create .env files with following content


./.env
```
API_URL = "http://server:8000/api/inngest"
POSTGRES_USER = postgres
OSTGRES_PASSWORD = postgres
POSTGRES_DB = rag_bot

```

./server/.env

```
OLLAMA_API_URL = 'http://host.docker.internal:11434'
QDRANT_URL = "http://qdrant:6333"
INGGEST_API_URL= "http://inngest:8288/v1"
INNGEST_BASE_URL="http://inngest:8288"
INNGEST_DEV=1
POSTGRES_USER= postgres
POSTGRES_PASSWORD= postgres
POSTGRES_DB=rag_bot

```

./client/.env

```
VITE_API_URL = 'http://localhost:8000'
```
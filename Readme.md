# RagDoc


./.env
```
API_URL = "http://server:8000/api/inngest"
POSTGRES_USER= postgres
OSTGRES_PASSWORD= postgres
POSTGRES_DB=rag_bot

```

./server/.env

```
OLLAMA_API_URL = 'http://host.docker.internal:11434'
QDRANT_URL = "http://qdrant:6333"
INGGEST_API_URL= "http://inngest:8288/v1"
INNGEST_BASE_URL="http://inngest:8288"
INNGEST_DEV=1

```

./client/.env

```
VITE_API_URL = 'http://localhost:8000'
```
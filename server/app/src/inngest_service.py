import httpx
import inngest
import requests
import asyncio
from src.vector_db import QdrantService
from src.database_service import DatabaseService
from src.data_processor import parse_pdf_chunk
from src.ai_helper import run_prompt, generate_text_embeddings
from src.utils import sanitize_query
from src.constants import USER_COLLECTIONS, PROMPT
from src.config import CONFIDENT_THRESHOLD, INNGEST_API_URL

from src.custom_types import (
    RAGChunksSource,
    RAGQueryResults,
    RAGSearchResult,
    RAGUpsertPayload,
    RAGUpsertResults,
)
import uuid


class InngestService:
    def __init__(self, ctx: inngest.Context):
        self.ctx = ctx

    async def rag_inngest_pdf(self):
        ctx = self.ctx
        event_data = ctx.event.data

        user_id = event_data.get("user_id")
        filepath = event_data.get("filepath")
        workspace_id = event_data.get("workspace_id")

        if not filepath:
            raise ValueError("Missing required 'filepath' in event data")
        if not user_id:
            raise ValueError("Missing required 'user_id' in event data")

        def _load(ctx: inngest.Context) -> RAGChunksSource:

            source_id = ctx.event.data.get("source_id", filepath)
            chunks = parse_pdf_chunk(filepath)
            return RAGChunksSource(chunks=chunks, source_id=source_id)

        async def _process_chunks(chunks: list[str]) -> list[str] | None:
            embeddings = await generate_text_embeddings(chunks)
            return embeddings

        def _upsert(payload: RAGUpsertPayload, user_id) -> RAGUpsertResults:
            source_id = payload.source_id
            embeddings = payload.embeddings
            chunks = payload.chunks

            ids = [
                str(uuid.uuid5(uuid.NAMESPACE_URL, name=f"{source_id}:{i}"))
                for i in range(len(chunks))
            ]

            qdrant_payload = [
                {"source": source_id, "text": chunks[i], "workspace_id": workspace_id}
                for i in range(len(chunks))
            ]

            user = DatabaseService().find_user("", user_id)

            QdrantService(collection=user.collection_name).upsert(
                ids, embeddings, qdrant_payload
            )
            return RAGUpsertResults(ingested=len(embeddings))

        chunk_payload: RAGChunksSource = await ctx.step.run(
            "pdf-chunking", lambda: _load(ctx), output_type=RAGChunksSource
        )

        chunks = chunk_payload.chunks
        embeddings = await ctx.step.run(
            "chunks-to-embeddings", lambda: _process_chunks(chunks)
        )

        source_id = chunk_payload.source_id

        upsert_data = RAGUpsertPayload(
            chunks=chunks, source_id=source_id, embeddings=embeddings
        )

        ingested: RAGUpsertResults = await ctx.step.run(
            "vector-embedding-upsert",
            lambda: _upsert(upsert_data, user_id),
            output_type=RAGUpsertResults,
        )

        return ingested.model_dump()

    async def query_pdf(self):
        ctx = self.ctx
        event_data = ctx.event.data
        user_id = event_data.get("user_id")
        query = event_data.get("query")
        top_k = int(event_data.get("top_k", 5))

        workspace_id = event_data.get("workspace_id")

        if not query:
            raise ValueError("Missing required 'query' in event data")
        if not user_id:
            raise ValueError("Missing required 'user_id' in event data")

        if not workspace_id:
            raise ValueError("Missing required 'workspace_id' in event data")

        # sanitize before anything else
        try:
            query = sanitize_query(query)
        except ValueError:
            return {
                "query": query,
                "result": "Sorry, I cannot help with this query.",
                "context_len": 0,
                "context": [],
            }

        async def _process_chunks(query: list[str]) -> list[str] | None:
            embeddings = await generate_text_embeddings(query)
            return embeddings

        async def _search(query: str, user_id: int, top_k: int = 5):
            query_embedding = await _process_chunks(query)
            user = DatabaseService().find_user("", user_id)
            results = QdrantService(collection=user.collection_name).search(
                query_vector=query_embedding[0], workspace_id=workspace_id, top_k=top_k
            )
            return results

        _results = await ctx.step.run(
            "embed-search",
            lambda: _search(query, user_id, top_k),
        )

        results = [item for item in _results if item["score"] > CONFIDENT_THRESHOLD]

        if not len(results):
            return {
                "query": query,
                "result": "Sorry, I cannot help with this query.",
                "context_len": 0,
                "context": [],
            }

        context_block = "\n\n".join(f"- {item['text']}" for item in results)

        ai_answer = await ctx.step.run(
            "run-ai-prompt",
            lambda: run_prompt(PROMPT.format(context_block=context_block, query=query)),
        )

        return {
            "query": query,
            "result": ai_answer,
            "context_len": len(results),
            "context": [
                {"source": item["source"], "score": item["score"]} for item in results
            ],
        }

    async def register_user(self, email):

        user = DatabaseService().find_user(email, None)

        if getattr(user, "collection_name", None):
            QdrantService(
                collection=getattr(user, "collection_name"), verify=False
            ).setup_user_collection(),
            return {
                "user": user.model_dump() if user else None,
                "message": "User create success",
            }

        user_key = uuid.uuid4()
        collection_name = USER_COLLECTIONS.format(USERID=user_key)

        DatabaseService().insert_user(email, collection_name),
        QdrantService(collection=collection_name, verify=False).setup_user_collection(),

        user = DatabaseService().find_user(email, None)

        return {
            "user": user.model_dump() if user else None,
            "message": "User create success",
        }

    async def get_event_data(self, event_id: str):
        url = f"{INNGEST_API_URL}/events/{event_id}/runs"
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            json_data = response.json()
            return json_data["data"]

    async def get_run_data(self, event_id: str):
        await asyncio.sleep(2)
        event_runs = await self.get_event_data(event_id)
        run_id = event_runs[0].get("run_id")
        url = f"{INNGEST_API_URL}/runs/{run_id}"
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            json_data = response.json()
            return json_data["data"]

    async def get_run_output(self, event_id: str):
        if not event_id:
            return None

        run = await self.get_run_data(event_id)
        run_status = run.get("status")

        while run_status != "Completed":
            if run_status in ["Failed", "Cancelled"]:
                raise Exception(f"Function run {run_status}")

            await asyncio.sleep(1)
            run = await self.get_run_data(event_id)
            run_status = run.get("status")

        return run

from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class RAGChunksSource(BaseModel):
    chunks: list[str]
    source_id: str = None


class RAGUpsertResults(BaseModel):
    ingested: int


class RAGSearchResult(BaseModel):
    chunks: list[str]
    sources: list[str]


class RAGQueryResults(BaseModel):
    answer: str
    sources: list[str]
    num_contexts: int


class RAGUpsertPayload(BaseModel):
    chunks: list[str]
    source_id: str = None
    embeddings: list[list[float]]


class UserRegister(BaseModel):
    email: str


class IngestDocument(BaseModel):
    user_id: int
    file_path: str
    file_key: str
    workspace_id: int


class DatabaseWorkspace(BaseModel):
    id: int
    user_id: int
    name: str
    tags: str | None
    description: str | None


class CreateWorkspace(BaseModel):
    user_id: int
    name: str
    tags: str | None = None
    description: str | None = None


class DatabaseUser(BaseModel):
    email: str
    collection_name: str
    id: int
    add_date: datetime
    workspaces: list[DatabaseWorkspace]


class DatabaseFileUpload(BaseModel):
    id: int
    user_id: int
    workspace_id: int
    file_name: str
    file_path: str
    uploaded_at: datetime


class QueryPDF(BaseModel):
    user_id: int
    workspace_id: int
    top_k: int
    query: str

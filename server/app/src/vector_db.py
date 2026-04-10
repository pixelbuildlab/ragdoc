from qdrant_client import QdrantClient
from qdrant_client.models import (
    VectorParams,
    Distance,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
)
from src.config import QDRANT_URL, QDRANT_DIMS, QDRANT_TOP_K


class QdrantService:
    def __init__(self, collection, url=QDRANT_URL, dim=QDRANT_DIMS, verify=True):
        self.client = QdrantClient(url=url, timeout=30)
        self.collection = collection
        self.dim = dim
        if not self.collection:
            raise ValueError("Missing collection value")
        if not self.client.collection_exists(self.collection) and verify:
            raise ValueError("Collection does not exist")

    def upsert(self, ids, vectors, payload):
        points = [
            PointStruct(id=ids[i], vector=vectors[i], payload=payload[i])
            for i in range(len(ids))
        ]
        self.client.upsert(self.collection, points=points)

    def setup_user_collection(self):
        if not self.client.collection_exists(self.collection):
            self.client.create_collection(
                collection_name=self.collection,
                vectors_config=VectorParams(size=self.dim, distance=Distance.COSINE),
            )
        try:
            self.client.create_payload_index(
                collection_name=self.collection,
                field_name="workspace_id",
                field_schema="integer",
            )
        except Exception as e:
            print(f"Index may already exist: {e}")

    def search(
        self,
        query_vector,
        workspace_id: int,
        top_k=QDRANT_TOP_K,
    ):
        results = self.client.query_points(
            collection_name=self.collection,
            query=query_vector,
            with_payload=True,
            limit=top_k,
            query_filter=Filter(
                must=[
                    FieldCondition(
                        key="workspace_id", match=MatchValue(value=int(workspace_id))
                    )
                ]
            ),
        )

        search_results = []

        points = results.points

        for point in points:
            search_result = dict()
            payload = getattr(point, "payload", None) or {}
            score = getattr(point, "score", None)
            text = payload.get("text", "")
            source = payload.get("source", "")
            if text:
                search_result["text"] = text
                search_result["source"] = source
                search_result["score"] = score
                search_results.append(search_result)

        return search_results

import requests
import json
from requests.exceptions import HTTPError
from src.config import (
    OLLAMA_API_URL,
    OLLAMA_EMBED_MODEL,
    OLLAMA_COMPLETION_MODEL,
)


async def run_prompt(prompt: str):
    try:
        data = json.dumps(
            {
                "model": OLLAMA_COMPLETION_MODEL,
                "prompt": prompt,
                "stream": False,
                "think": False,
            }
        )

        response = requests.post(
            f"{OLLAMA_API_URL}/api/generate",
            data=data,
            headers={"Content-Type": "application/json"},
        )

        response.raise_for_status()

        result: dict = response.json()

        output = result.get("response")

        if not output:
            raise ValueError("No response returned from model")

        return output

    except HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
    except Exception as err:
        print(f"Other error occurred: {err}")


async def generate_text_embeddings(text: list[str]):
    try:
        data = json.dumps({"model": OLLAMA_EMBED_MODEL, "input": text})
        response = requests.post(
            f"{OLLAMA_API_URL}/api/embed",
            data=data,
        )

        response.raise_for_status()
        data: dict = response.json()

        embeddings = data.get("embeddings", None)

        if not embeddings:
            raise ValueError("Value missing for embeddings")

        return embeddings

    except HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
    except Exception as err:
        print(f"Other error occurred: {err}")

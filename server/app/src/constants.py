USER_COLLECTIONS = "rag_document_collection_user_{USERID}"
UUID_STR = "rag_bot"
PROMPT = """
    You are a retrieval-based assistant.

    Answer the question ONLY using the provided context.
    Do not use outside knowledge.

    If the answer is not clearly found in the context, reply exactly:
    Sorry, I cannot help with this query.

    Context:
    {context_block}

    Question:
    {query}

    Answer:
    """

INSERT_USER_QUERY = "INSERT INTO users (email, collection_name) VALUES ('{USER_EMAIL}', '{COLLECTION_NAME}');"

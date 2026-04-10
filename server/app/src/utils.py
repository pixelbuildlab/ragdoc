import re

MAX_QUERY_LENGTH = 500
INJECTION_PATTERNS = [
    r"ignore\s+(previous|above|all)\s+instructions",
    r"forget\s+(everything|context|instructions)",
    r"you\s+are\s+now",
    r"act\s+as",
    r"roleplay",
    r"pretend\s+(you\s+are|to\s+be)",
    r"system\s*prompt",
    r"jailbreak",
]


def sanitize_query(query: str) -> str:
    query = query.strip()[:MAX_QUERY_LENGTH]
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, query, re.IGNORECASE):
            raise ValueError("Query contains disallowed content.")
    return query

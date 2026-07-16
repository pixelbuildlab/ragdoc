from llama_index.readers.file import PDFReader
from llama_index.core import Document
from llama_index.core.node_parser import SentenceSplitter

splitter = SentenceSplitter(
    chunk_size=400,
    chunk_overlap=50,
)


def chunk_raw_document(document_content: str):
    if not document_content:
        return []
    doc = Document(text=document_content)
    nodes = splitter.get_nodes_from_documents([doc])

    return [node.get_content() for node in nodes if node.get_content().strip()]


def parse_pdf_chunk(filepath: str):
    if not filepath:
        return []
    docs = PDFReader().load_data(file=filepath)
    nodes = splitter.get_nodes_from_documents(docs)

    return [node.get_content() for node in nodes if node.get_content().strip()]
    # texts = [doc.text for doc in docs if getattr(doc, "text", None)]

    # chunks = []
    # for text in texts:
    #     chunks.extend(splitter.split_text(text=text))
    # return chunks

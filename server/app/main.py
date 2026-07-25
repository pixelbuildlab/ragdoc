from fastapi import FastAPI, UploadFile, File, Form
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import uuid
import logging
import inngest
from inngest import fast_api
from src.inngest_service import InngestService
from src.database_service import DatabaseService
from src.custom_types import (
    UserRegister,
    IngestDocument,
    CreateWorkspace,
    QueryPDF,
    IngestLiveDocument,
)

logger = logging.getLogger("uvicorn")

inngest_client = inngest.Inngest(
    app_id="rag_bot",
    logger=logger,
    is_production=False,
    serializer=inngest.PydanticSerializer(),
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@inngest_client.create_function(
    fn_id="Ingest RAG", trigger=inngest.TriggerEvent(event="rag/ingest_pdf")
)
async def rag_inngest_pdf(ctx: inngest.Context):
    return await InngestService(ctx).rag_inngest_pdf()


@inngest_client.create_function(
    fn_id="Query RAG PDF", trigger=inngest.TriggerEvent(event="rag/query-pdf")
)
async def query_pdf(ctx: inngest.Context):
    return await InngestService(ctx).query_pdf()


@inngest_client.create_function(
    fn_id="Ingest Live Url", trigger=inngest.TriggerEvent(event="rag/ingest_live_url")
)
async def rag_inngest_url(ctx: inngest.Context):
    return await InngestService(ctx).rag_ingest_live_url()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Application is starting up...")
    logger.info("Authenticate database...")
    await DatabaseService().authenticate()
    yield
    logger.info("Application is shutting down...")


app = FastAPI(lifespan=lifespan)

origins = ["*"]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/access")
async def access(user: UserRegister):
    email = user.email
    try:
        results = await InngestService(None).register_user(email)

        return results
    except Exception as e:
        return {"message": "Failure", "error": str(e)}


async def file_saver(file: UploadFile, user_id: str, workspace_id: str):
    file_key = str(uuid.uuid4())

    user_folder = UPLOAD_DIR / user_id / workspace_id
    user_folder.mkdir(parents=True, exist_ok=True)

    file_path = user_folder / file.filename

    file_upload_status = DatabaseService().create_file_upload(
        file_key, int(user_id), int(workspace_id), file.filename, str(file_path)
    )

    if not file_upload_status:
        raise Exception("Failed to upload file")

    with open(file_path, "wb") as f:
        f.write(await file.read())

    return file_key, file_path


@app.post("/upload")
async def upload_pdf_file(
    user_id: str = Form(...),
    workspace_id: str = Form(...),
    files: list[UploadFile] = list[File(...)],
):
    try:
        if not user_id or not workspace_id:
            raise Exception("Missing values")
        # if [file.content_type != "application/pdf" for file in files]:
        #     raise Exception(".pdf file required")

        if len(files) > 5:
            raise Exception("Maximum of 5 files allowed")

        files_list = list()
        for file in files:
            file_key, file_path = await file_saver(file, user_id, workspace_id)
            files_list.append(
                {
                    "file_key": str(file_key),
                    "file_path": str(file_path),
                }
            )

        return {
            "message": "File uploaded successfully",
            "files_list": files_list,
        }

    except Exception as e:
        return {"message": "Failure", "error": str(e)}


@app.post("/ingest")
async def ingest_file(file: IngestDocument):

    inngest_runs = await inngest_client.send(
        inngest.Event(
            name="rag/ingest_pdf",
            data={
                "user_id": file.user_id,
                "filepath": file.file_path,
                "workspace_id": file.workspace_id,
            },
        )
    )

    run_data = await InngestService(None).get_run_output(inngest_runs[0])

    return {"job_run_data": run_data["output"]}


@app.post("/query")
async def query_rag(user_query: QueryPDF):

    inngest_runs = await inngest_client.send(
        inngest.Event(
            name="rag/query-pdf",
            data={
                "user_id": user_query.user_id,
                "query": user_query.query,
                "workspace_id": user_query.workspace_id,
                "top_k": user_query.top_k,
            },
        )
    )

    run_data = await InngestService(None).get_run_output(inngest_runs[0])

    return {"query_results": run_data["output"]}


@app.post("/workspace")
async def create_workspace(workspace: CreateWorkspace):
    DatabaseService().create_workspace(
        workspace.name, workspace.description, workspace.user_id, workspace.tags
    )
    workspaces = DatabaseService().find_workspaces(workspace.user_id)

    return {"workspaces": workspaces}


@app.get("/user_uploads")
async def get_user_uploads(user_id: int, workspace_id: int):
    uploads = DatabaseService().find_files(user_id, workspace_id)

    return {"uploads": uploads}


@app.post("/ingest_live_url")
async def ingest_live_url(live_req: IngestLiveDocument):
    file_key = str(uuid.uuid4())
    DatabaseService().create_file_upload(
        file_key,
        int(live_req.user_id),
        int(live_req.workspace_id),
        live_req.url_list,
        str(live_req.url_list),
    )
    inngest_runs = await inngest_client.send(
        inngest.Event(
            name="rag/ingest_live_url",
            data={
                "user_id": live_req.user_id,
                "url_list": live_req.url_list,
                "workspace_id": live_req.workspace_id,
            },
        )
    )

    run_data = await InngestService(None).get_run_output(inngest_runs[0])

    return {"job_run_data": run_data["output"]}


fast_api.serve(
    app=app,
    client=inngest_client,
    functions=[rag_inngest_pdf, query_pdf, rag_inngest_url],
)

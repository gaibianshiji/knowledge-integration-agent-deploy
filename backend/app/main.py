import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.routers import upload, graph, rag, chat, integration
from app.services.pdf_parser import preload_textbooks
from app.services.graph_service import preload_graphs

app = FastAPI(title="学科知识整合智能体", version="1.0.0")

@app.on_event("startup")
async def startup():
    preload_textbooks()
    preload_graphs()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api/upload", tags=["upload"])
app.include_router(graph.router, prefix="/api/graph", tags=["graph"])
app.include_router(rag.router, prefix="/api/rag", tags=["rag"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(integration.router, prefix="/api/integration", tags=["integration"])

@app.get("/api/health")
async def health():
    return {"status": "ok"}

# Serve React frontend
FRONTEND_DIR = Path(__file__).parent.parent / "static"
if FRONTEND_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIR / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(request: Request, full_path: str):
        file_path = FRONTEND_DIR / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(FRONTEND_DIR / "index.html"))
else:
    @app.get("/")
    async def root():
        return {"message": "学科知识整合智能体 API"}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.document_router import router as document_router

app = FastAPI()

# Allow frontends from other origins/ports (e.g., Vite dev server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(document_router, prefix="/api/v1", tags=["documents"])


@app.get("/")
def read_root():
    return {"message": "Hello, World!, this is"}

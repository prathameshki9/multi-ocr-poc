from fastapi import FastAPI
from routers.document_router import router as document_router

app = FastAPI()

app.include_router(document_router, prefix="/api/v1", tags=["documents"])

@app.get("/")
def read_root():
    return {"message": "Hello, World!, this is"}

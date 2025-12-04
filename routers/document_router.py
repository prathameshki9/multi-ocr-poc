from fastapi import APIRouter, UploadFile, File
from controllers.document_controller import DocumentController

router = APIRouter()
controller = DocumentController()

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    return await controller.upload_document(file)
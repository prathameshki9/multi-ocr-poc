from fastapi import APIRouter, UploadFile, File
from controllers.document_controller import DocumentController

router = APIRouter()
controller = DocumentController()

@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    return await controller.upload_document(file)

@router.get("/upload")
async def get_document(filename: str = None):
    """
    Get processed document data.
    - If no filename is provided: returns list of all available files
    - If filename is provided: returns the content of that specific file
    
    Example: GET /documents/upload
    Example: GET /documents/upload?filename=invoice_response.json
    """

    return await controller.get_document(filename)
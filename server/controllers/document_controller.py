from fastapi import UploadFile, HTTPException
from services.document_service import DocumentService
import json
import os

class DocumentController:
    def __init__(self):
        self.document_service = DocumentService()

    async def upload_document(self, file: UploadFile):
        if not file:
            raise HTTPException(status_code=400, detail="No file sent")
        
        content = await file.read()
        result = self.document_service.process_document(content, filename=file.filename)
        return {"message": result}

    async def get_document(self, filename: str = None):
        """
        Get the JSON output for a processed document.
        If filename is provided, returns that specific file.
        Otherwise, returns a list of available files.
        """
        json_output_dir = "output/layout_output"
        
        # If no filename provided, list all available files
        if not filename:
            if not os.path.exists(json_output_dir):
                return {"data": [], "message": "No documents processed yet"}
            
            files = [f for f in os.listdir(json_output_dir) if f.endswith('.json')]
            return {
                "data": files,
                "message": f"Found {len(files)} processed document(s)"
            }
        
        # If filename provided, return that specific file's content
        file_path = os.path.join(json_output_dir, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"File '{filename}' not found")
        
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
            return {"data": data, "filename": filename}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")

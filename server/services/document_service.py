import logging
import os
import json
from services.textract_service import TextractManager

logger = logging.getLogger(__name__)


class DocumentService:
    def __init__(self):
        """Initialize the DocumentService with TextractManager."""
        self.textract_manager = TextractManager()
    
    def process_document(self, file_content: bytes, filename: str = None, feature_types: list = None) -> dict:
        """
        Process a document using AWS Textract.
        
        :param file_content: The document file content as bytes
        :param filename: Optional filename to determine file type (PDF vs image)
        :param feature_types: List of features to extract (default: ["LAYOUT", "TABLES", "FORMS"])
        :return: Dictionary with Textract analysis results
        """
        try:
            logger.info(f"Processing document: {filename if filename else 'uploaded file'}")
            
            # Use the TextractManager to process the document
            # This will automatically save 3 JSON files if filename is provided
            result = self.textract_manager.process_document(
                file_bytes=file_content,
                feature_types=feature_types,
                save_files=True if filename else False,
                output_base_path=filename if filename else None
            )
            
            logger.info("Document processed successfully")
            return {
                "status": "success",
                "message": "Document processed successfully",
                "data": result.get('LayoutData', [])
            }
            
        except Exception as e:
            logger.error(f"Error processing document: {e}")
            return {
                "status": "error",
                "message": f"Failed to process document: {str(e)}",
                "data": None
            }


import logging
import os
import json
from textract_manager import TextractManager

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
            result = self.textract_manager.process_document(
                file_bytes=file_content,
                feature_types=feature_types
            )
            
            # Save the full Textract result to JSON file in output directory
            if filename:
                # Create output directory if it doesn't exist
                output_dir = "output/json_output"
                os.makedirs(output_dir, exist_ok=True)
                
                # Generate output filename (remove extension and add _response.json)
                base_filename = os.path.splitext(filename)[0]
                output_path = os.path.join(output_dir, f"{base_filename}_response.json")
                
                # Save the result to JSON file
                with open(output_path, 'w') as f:
                    json.dump(result, f, indent=4)
                
                logger.info(f"Textract result saved to {output_path}")

            
            logger.info("Document processed successfully")
            return {
                "status": "success",
                "message": "Document processed successfully",
                "data": self.get_layout_text(result, filename)
            }
            
        except Exception as e:
            logger.error(f"Error processing document: {e}")
            return {
                "status": "error",
                "message": f"Failed to process document: {str(e)}",
                "data": None
            }
    
    def get_layout_text(self, textract_response: dict, filename: str = None) -> list:
        """
        Extract layout text from Textract response.
        
        :param textract_response: The Textract response dictionary
        :return: List of layout blocks with their text content
        """
        blocks_map = {block['Id']: block for block in textract_response.get('Blocks', [])}
        layout_blocks = []
        
        for block in textract_response.get('Blocks', []):
            if block['BlockType'].startswith('LAYOUT_'):
                text = self.textract_manager.get_text_for_block(block, blocks_map)
                layout_blocks.append({
                    'type': block['BlockType'],
                    'text': text,
                    'page': block.get('Page', 1),
                    'confidence': block.get('Confidence', 0)
                })
        
        # Save the layout blocks to JSON file in output directory
        if filename:
            # Create output directory if it doesn't exist
            output_dir = "output/layout_output"
            os.makedirs(output_dir, exist_ok=True)
            
            # Generate output filename (remove extension and add _layout.json)
            base_filename = os.path.splitext(filename)[0]
            output_path = os.path.join(output_dir, f"{base_filename}_layout.json")
            
            # Save the layout blocks to JSON file
            with open(output_path, 'w') as f:
                json.dump(layout_blocks, f, indent=4)
            
            logger.info(f"Layout blocks saved to {output_path}")

        return layout_blocks


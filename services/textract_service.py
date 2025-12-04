import boto3
import json
import logging
import time
from botocore.exceptions import ClientError
import os
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

class TextractManager:
    def __init__(self):
        """Initialize the Textract client."""
        # Ensure environment variables are loaded or passed explicitly
        # Using environment variables for credentials
        self.textract_client = boto3.client(
            'textract', 
            region_name='ap-south-1', 
            aws_access_key_id=os.getenv('aws_access_key_id'), 
            aws_secret_access_key=os.getenv('aws_secret_access_key'), 
            aws_session_token=os.getenv('aws_session_token')
        )
        self.s3_client = boto3.client(
            's3',
            region_name='ap-south-1',
            aws_access_key_id=os.getenv('aws_access_key_id'),
            aws_secret_access_key=os.getenv('aws_secret_access_key'),
            aws_session_token=os.getenv('aws_session_token')
        )
        self.bucket_name = "textract-ocr-poc-bucket"

    def analyze_file(
        self, feature_types, *, document_file_name=None, document_bytes=None
    ):
        """
        Detects text and additional elements, such as forms or tables, in a local image
        file or from in-memory byte data.
        The image must be in PNG or JPG format.

        :param feature_types: The types of additional document features to detect.
        :param document_file_name: The name of a document image file.
        :param document_bytes: In-memory byte data of a document image.
        :return: The response from Amazon Textract, including a list of blocks
                 that describe elements detected in the image.
        """
        if document_file_name is not None:
            with open(document_file_name, "rb") as document_file:
                document_bytes = document_file.read()
        try:
            response = self.textract_client.analyze_document(
                Document={"Bytes": document_bytes}, FeatureTypes=feature_types
            )
            logger.info("Detected %s blocks.", len(response["Blocks"]))
        except ClientError:
            logger.exception("Couldn't detect text.")
            raise
        else:
            return response

    def upload_to_s3(self, file_path, object_name):
        try:
            self.s3_client.upload_file(file_path, self.bucket_name, object_name)
            logger.info(f"Uploaded {file_path} to s3://{self.bucket_name}/{object_name}")
        except ClientError as e:
            logger.error(f"Error uploading to S3: {e}")
            raise

    def wait_for_job(self, job_id):
        while True:
            response = self.textract_client.get_document_analysis(JobId=job_id)
            status = response['JobStatus']
            logger.info(f"Job status: {status}")
            
            if status in ['SUCCEEDED', 'FAILED']:
                if status == 'FAILED':
                    raise Exception(f"Job failed: {response}")
                break
            
            time.sleep(5)
        
        # Fetch all blocks (pagination)
        blocks = []
        next_token = None
        document_metadata = response.get('DocumentMetadata', {'Pages': 0})
        model_version = response.get('AnalyzeDocumentModelVersion', '1.0')
        
        while True:
            params = {'JobId': job_id}
            if next_token:
                params['NextToken'] = next_token
                
            response = self.textract_client.get_document_analysis(**params)
            blocks.extend(response['Blocks'])
            
            if 'DocumentMetadata' in response:
                document_metadata = response['DocumentMetadata']
            if 'AnalyzeDocumentModelVersion' in response:
                model_version = response['AnalyzeDocumentModelVersion']

            next_token = response.get('NextToken')
            if not next_token:
                break
                
        final_response = {
            'DocumentMetadata': document_metadata,
            'Blocks': blocks,
            'AnalyzeDocumentModelVersion': model_version
        }
        return final_response

    def analyze_pdf(self, file_path, feature_types):
        file_name = os.path.basename(file_path)
        self.upload_to_s3(file_path, file_name)
        
        try:
            response = self.textract_client.start_document_analysis(
                DocumentLocation={
                    'S3Object': {
                        'Bucket': self.bucket_name,
                        'Name': file_name
                    }
                },
                FeatureTypes=feature_types
            )
            job_id = response['JobId']
            logger.info(f"Started job {job_id}")
            
            return self.wait_for_job(job_id)
        except ClientError as e:
            logger.error(f"Error starting analysis: {e}")
            raise

    def get_text_for_block(self, block, blocks_map):
        """Extracts text from child LINE/WORD blocks."""
        text = ""
        if 'Relationships' in block:
            for rel in block['Relationships']:
                if rel['Type'] == 'CHILD':
                    for child_id in rel['Ids']:
                        child = blocks_map.get(child_id)
                        if child and child['BlockType'] in ['WORD', 'LINE']:
                            text += child.get('Text', '') + ' '
        return text.strip()

    def enrich_response_with_text(self, response):
        """
        Enriches the Textract response by adding a 'Text' field to LAYOUT_* and CELL blocks
        derived from their child relationships.
        """
        blocks_map = {block['Id']: block for block in response['Blocks']}
        
        for block in response['Blocks']:
            if block['BlockType'].startswith('LAYOUT_') or block['BlockType'] == 'CELL':
                text = self.get_text_for_block(block, blocks_map)
                block['Text'] = text
        
        return response

    def enrich_tables(self, response):
        """
        Enriches TABLE blocks with a structured 'TableData' field containing detailed cell info
        and a 'Text' field containing a Markdown representation.
        """
        blocks_map = {block['Id']: block for block in response['Blocks']}
        
        for block in response['Blocks']:
            if block['BlockType'] == 'TABLE':
                rows = {}
                if 'Relationships' in block:
                    for rel in block['Relationships']:
                        if rel['Type'] == 'CHILD':
                            for child_id in rel['Ids']:
                                cell = blocks_map.get(child_id)
                                if cell and cell['BlockType'] == 'CELL':
                                    row_idx = cell['RowIndex']
                                    col_idx = cell['ColumnIndex']
                                    
                                    # Extract detailed cell info
                                    cell_data = {
                                        "text": cell.get('Text', ''),
                                        "rowIndex": row_idx,
                                        "columnIndex": col_idx,
                                        "rowSpan": cell.get('RowSpan', 1),
                                        "columnSpan": cell.get('ColumnSpan', 1),
                                        "confidence": cell.get('Confidence'),
                                        "geometry": cell.get('Geometry'),
                                        "entityTypes": cell.get('EntityTypes', [])
                                    }
                                    
                                    if row_idx not in rows:
                                        rows[row_idx] = {}
                                    rows[row_idx][col_idx] = cell_data
                
                # Convert to list of lists
                sorted_row_indices = sorted(rows.keys())
                table_data = []
                markdown_rows = []
                
                for r_idx in sorted_row_indices:
                    row_cells = rows[r_idx]
                    sorted_col_indices = sorted(row_cells.keys())
                    
                    # For TableData (detailed objects)
                    row_data = [row_cells[c_idx] for c_idx in sorted_col_indices]
                    table_data.append(row_data)
                    
                    # For Markdown Text
                    # We need to handle missing columns for proper markdown alignment if needed,
                    # but for now we'll just join the text of existing cells.
                    # A robust markdown table generator would need to handle spans and alignment.
                    # This is a simplified version.
                    row_text_list = [row_cells[c_idx]['text'] for c_idx in sorted_col_indices]
                    markdown_rows.append("| " + " | ".join(row_text_list) + " |")
                    
                    # Add separator after header (assuming first row is header for simplicity, 
                    # or just standard markdown table format)
                    if r_idx == 1:
                        # Create separator row based on number of columns in first row
                        sep_row = "| " + " | ".join(["---"] * len(row_text_list)) + " |"
                        markdown_rows.append(sep_row)

                block['TableData'] = table_data
                block['Text'] = "\n".join(markdown_rows)
                
        return response

    def _get_bounding_box(self, block):
        return block['Geometry']['BoundingBox']

    def _calculate_intersection_area(self, box1, box2):
        x1_min = box1['Left']
        x1_max = box1['Left'] + box1['Width']
        y1_min = box1['Top']
        y1_max = box1['Top'] + box1['Height']

        x2_min = box2['Left']
        x2_max = box2['Left'] + box2['Width']
        y2_min = box2['Top']
        y2_max = box2['Top'] + box2['Height']

        inter_x_min = max(x1_min, x2_min)
        inter_x_max = min(x1_max, x2_max)
        inter_y_min = max(y1_min, y2_min)
        inter_y_max = min(y1_max, y2_max)

        if inter_x_max < inter_x_min or inter_y_max < inter_y_min:
            return 0.0

        return (inter_x_max - inter_x_min) * (inter_y_max - inter_y_min)

    def generate_layout_output(self, response, output_path):
        """
        Generates a simplified layout-wise JSON output.
        Removes LAYOUT_TABLE blocks that are already covered by structured TABLE blocks.
        """
        # Separate blocks
        table_blocks = [b for b in response['Blocks'] if b['BlockType'] == 'TABLE']
        other_layout_blocks = [b for b in response['Blocks'] if b['BlockType'].startswith('LAYOUT_')]
        
        filtered_layout_blocks = []
        
        # Filter LAYOUT_TABLE blocks that overlap with TABLE blocks
        for layout_block in other_layout_blocks:
            if layout_block['BlockType'] == 'LAYOUT_TABLE':
                is_duplicate = False
                layout_box = self._get_bounding_box(layout_block)
                layout_area = layout_box['Width'] * layout_box['Height']
                
                for table_block in table_blocks:
                    # Check if on same page
                    if layout_block.get('Page', 1) != table_block.get('Page', 1):
                        continue
                        
                    table_box = self._get_bounding_box(table_block)
                    intersection = self._calculate_intersection_area(layout_box, table_box)
                    
                    # If intersection covers > 75% of the LAYOUT_TABLE, consider it a duplicate
                    if layout_area > 0 and (intersection / layout_area) > 0.75:
                        is_duplicate = True
                        break
                
                if not is_duplicate:
                    filtered_layout_blocks.append(layout_block)
            else:
                filtered_layout_blocks.append(layout_block)
        
        # Combine TABLE blocks and filtered layout blocks
        final_blocks = table_blocks + filtered_layout_blocks
        
        # Sort by Page, then Top, then Left
        final_blocks.sort(key=lambda x: (
            x.get('Page', 1), 
            x['Geometry']['BoundingBox']['Top'], 
            x['Geometry']['BoundingBox']['Left']
        ))
        
        output_data = []
        for block in final_blocks:
            item = {
                "type": block['BlockType'].replace('_', ' ').title(), # e.g. "Layout Header", "Table"
                "page": block.get('Page', 1),
                "confidence": block.get('Confidence'),
                "geometry": block.get('Geometry')
            }
            
            if block['BlockType'] == 'TABLE':
                item["type"] = "Layout Table" # Normalize name as requested
                item["table_data"] = block.get('TableData', [])
            else:
                item["text"] = block.get('Text', '')
            
            output_data.append(item)
            
        if output_path:
            with open(output_path, 'w') as f:
                json.dump(output_data, f, indent=4)
            logger.info(f"Layout output saved to {output_path}")
            
        return output_data

    def process_document(self, file_path=None, file_bytes=None, feature_types=None, save_files=True, output_base_path=None):
        """
        High-level method to process a document (image or PDF) and return enriched results.
        Optionally saves 3 JSON files: original, filtered, and layout-wise output.
        
        :param file_path: Path to the document file (optional if file_bytes is provided)
        :param file_bytes: Byte content of the document (optional if file_path is provided)
        :param feature_types: List of features to extract (default: ["LAYOUT", "TABLES", "FORMS"])
        :param save_files: Whether to save the 3 JSON files (default: True)
        :param output_base_path: Base path for output files (filename without extension)
        :return: Dictionary with enriched Textract response
        """
        if feature_types is None:
            feature_types = ["LAYOUT", "TABLES", "FORMS"]
        
        if not file_path and not file_bytes:
            raise ValueError("Either file_path or file_bytes must be provided")
        
        try:
            # Determine if it's a PDF or image
            is_pdf = False
            if file_path:
                is_pdf = file_path.lower().endswith('.pdf')
            
            # Process the document
            if is_pdf:
                logger.info(f"Processing PDF: {file_path}")
                result = self.analyze_pdf(file_path, feature_types)
            else:
                logger.info(f"Processing image document")
                result = self.analyze_file(
                    feature_types=feature_types,
                    document_file_name=file_path,
                    document_bytes=file_bytes
                )
            
            # Enrich the response with text for layout blocks and cells
            self.enrich_response_with_text(result)
            
            # Enrich tables with structured data
            self.enrich_tables(result)
            
            layout_data = []
            
            # Save files if requested
            if save_files and output_base_path:
                # Create output directories
                os.makedirs("output/json_output", exist_ok=True)
                os.makedirs("output/layout_output", exist_ok=True)
                
                base_filename = os.path.splitext(os.path.basename(output_base_path))[0]
                
                # 1. Save ORIGINAL unfiltered data (with WORD & LINE blocks)
                original_output = {
                    k: v for k, v in result.items() 
                    if k in ['DocumentMetadata', 'Blocks', 'HumanLoopActivationOutput', 'AnalyzeDocumentModelVersion']
                }
                original_filename = f"output/json_output/{base_filename}_original.json"
                with open(original_filename, 'w') as f:
                    json.dump(original_output, f, indent=4)
                logger.info(f"1. Original data saved to: {original_filename}")
                
                # 3. Generate and save LAYOUT-WISE output (Do this before filtering blocks)
                layout_filename = f"output/layout_output/{base_filename}_layout.json"
                layout_data = self.generate_layout_output(result, layout_filename)
                logger.info(f"3. Layout output saved to: {layout_filename}")

                # 2. Save FILTERED data (without WORD & LINE blocks)
                # Filter out WORD and LINE blocks
                filtered_blocks = [b for b in result['Blocks'] if b['BlockType'] not in ['WORD', 'LINE']]
                filtered_output = {
                    k: (filtered_blocks if k == 'Blocks' else v) 
                    for k, v in result.items() 
                    if k in ['DocumentMetadata', 'Blocks', 'HumanLoopActivationOutput', 'AnalyzeDocumentModelVersion']
                }
                filtered_filename = f"output/json_output/{base_filename}_response.json"
                with open(filtered_filename, 'w') as f:
                    json.dump(filtered_output, f, indent=4)
                logger.info(f"2. Filtered data saved to: {filtered_filename}")
                
            else:
                # Generate layout data without saving
                layout_data = self.generate_layout_output(result, None)
            
            # Return the enriched result (with all blocks including WORD & LINE)
            # We also attach the layout_data so the controller can return it
            output = {
                k: v for k, v in result.items() 
                if k in ['DocumentMetadata', 'Blocks', 'HumanLoopActivationOutput', 'AnalyzeDocumentModelVersion']
            }
            output['LayoutData'] = layout_data
            
            logger.info("Document processing completed successfully")
            return output
            
        except Exception as e:
            logger.error(f"Error processing document: {e}")
            raise

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
        Enriches the Textract response by adding a 'Text' field to LAYOUT_* blocks
        derived from their child relationships.
        """
        blocks_map = {block['Id']: block for block in response['Blocks']}
        
        for block in response['Blocks']:
            if block['BlockType'].startswith('LAYOUT_'):
                text = self.get_text_for_block(block, blocks_map)
                block['Text'] = text
        
        return response

    def print_layout_analysis(self, response):
        """Prints the layout analysis results."""
        blocks_map = {block['Id']: block for block in response['Blocks']}
        
        print(f"Document has {response['DocumentMetadata']['Pages']} pages.")
        
        layout_blocks = [b for b in response['Blocks'] if b['BlockType'].startswith('LAYOUT_')]
        layout_blocks.sort(key=lambda x: (x.get('Page', 1), x['Geometry']['BoundingBox']['Top']))

        for block in layout_blocks:
            text = self.get_text_for_block(block, blocks_map)
            # Format block type: LAYOUT_HEADER -> Layout Header
            block_type = block['BlockType'].replace('_', ' ').title()
            print(f"heading: {block_type}")
            print(f"Content: {text}\n")

    def process_document(self, file_path=None, file_bytes=None, feature_types=None):
        """
        High-level method to process a document (image or PDF) and return enriched results.
        
        :param file_path: Path to the document file (optional if file_bytes is provided)
        :param file_bytes: Byte content of the document (optional if file_path is provided)
        :param feature_types: List of features to extract (default: ["LAYOUT", "TABLES", "FORMS"])
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
            
            # Enrich the response with text for layout blocks
            result = self.enrich_response_with_text(result)
            
            # Filter to clean output format
            output = {
                k: v for k, v in result.items() 
                if k in ['DocumentMetadata', 'Blocks', 'HumanLoopActivationOutput', 'AnalyzeDocumentModelVersion']
            }
            
            logger.info("Document processing completed successfully")
            return output
            
        except Exception as e:
            logger.error(f"Error processing document: {e}")
            raise

    def save_response_to_file(self, response, output_path):
        """
        Save the Textract response to a JSON file.
        
        :param response: The Textract response dictionary
        :param output_path: Path where the JSON file should be saved
        """
        try:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            with open(output_path, 'w') as f:
                json.dump(response, f, indent=4)
            logger.info(f"Response saved to {output_path}")
        except Exception as e:
            logger.error(f"Error saving response to file: {e}")
            raise



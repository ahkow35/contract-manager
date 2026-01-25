"""
Adobe PDF Services integration for DOCX to PDF conversion.
Updated for SDK v4.0.0+
"""

import os
import io
import logging
from fastapi import HTTPException

# Adobe SDK imports
try:
    from adobe.pdfservices.operation.auth.service_principal_credentials import ServicePrincipalCredentials
    from adobe.pdfservices.operation.pdf_services import PDFServices
    from adobe.pdfservices.operation.pdf_services_media_type import PDFServicesMediaType
    from adobe.pdfservices.operation.pdfjobs.jobs.create_pdf_job import CreatePDFJob
    from adobe.pdfservices.operation.pdfjobs.result.create_pdf_result import CreatePDFResult
except ImportError as e:
    logging.warning(f"Adobe PDF Services SDK import failed: {e}")

from app.config import settings

logger = logging.getLogger(__name__)


class AdobeConverter:
    """Service to handle document conversion using Adobe PDF Services."""

    @staticmethod
    def _get_credentials():
        """Constructs the Service Principal Credentials."""
        if not settings.adobe_client_id or not settings.adobe_client_secret:
            raise HTTPException(
                status_code=500,
                detail="Adobe credentials not configured."
            )
        
        return ServicePrincipalCredentials(
            client_id=settings.adobe_client_id,
            client_secret=settings.adobe_client_secret
        )

    @staticmethod
    def convert_docx_to_pdf(input_stream: io.BytesIO) -> io.BytesIO:
        """
        Converts a DOCX stream to a PDF stream using Adobe PDF Services.
        """
        print(f"DEBUG: Entering convert_docx_to_pdf. Settings ID present: {bool(settings.adobe_client_id)}", flush=True)
        
        if not settings.adobe_client_id or not settings.adobe_client_secret:
             print("DEBUG: Credentials check failed", flush=True)
             raise HTTPException(
                status_code=500,
                detail="Adobe PDF Services credentials not configured."
            )

        try:
            print("DEBUG: Getting credentials...", flush=True)
            credentials = AdobeConverter._get_credentials()
            pdf_services = PDFServices(credentials=credentials)
            
            # Reset input stream
            input_stream.seek(0)
            
            print("DEBUG: Uploading asset...", flush=True)
            # Upload Asset
            input_asset = pdf_services.upload(
                input_stream=input_stream, 
                mime_type=PDFServicesMediaType.DOCX
            )
            
            print("DEBUG: Creating job...", flush=True)
            # Create Job
            create_pdf_job = CreatePDFJob(input_asset)
            
            # Submit Job
            print("DEBUG: Submitting job...", flush=True)
            location = pdf_services.submit(create_pdf_job)
            
            # Get Result
            print("DEBUG: Polling result...", flush=True)
            pdf_services_response = pdf_services.get_job_result(location, CreatePDFResult)
            result_asset = pdf_services_response.get_result().get_asset()
            
            # Get Content
            print("DEBUG: Downloading content...", flush=True)
            stream_asset = pdf_services.get_content(result_asset)
            
            # Convert to BytesIO
            print("DEBUG: Converting to BytesIO...", flush=True)
            input_bytes = stream_asset.get_input_stream()
            print(f"DEBUG: input_stream type: {type(input_bytes)}", flush=True)
            
            output_stream = io.BytesIO(input_bytes)
            output_stream.seek(0)
            
            print(f"DEBUG: Success! Output size: {len(output_stream.getvalue())}", flush=True)
            return output_stream

        except Exception as e:
            print(f"DEBUG: EXCEPTION in convert_docx_to_pdf: {e}", flush=True)
            import traceback
            traceback.print_exc()
            logger.error(f"Adobe PDF Conversion failed: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"PDF Conversion failed: {str(e)}"
            )

"""
Adobe PDF Services integration for DOCX to PDF conversion.
Updated for SDK v4.0.0+
"""

import os
import io
import logging
from fastapi import HTTPException

logger = logging.getLogger(__name__)

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

# Remove duplicate logger declaration
# (The one at the top of file after imports is now the only one)

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
        logger.debug("Entering convert_docx_to_pdf. Settings ID present: %s", bool(settings.adobe_client_id))

        if not settings.adobe_client_id or not settings.adobe_client_secret:
             logger.debug("Credentials check failed")
             raise HTTPException(
                status_code=500,
                detail="Adobe PDF Services credentials not configured."
            )

        try:
            logger.debug("Getting credentials...")
            credentials = AdobeConverter._get_credentials()
            pdf_services = PDFServices(credentials=credentials)

            # Reset input stream
            input_stream.seek(0)

            logger.debug("Uploading asset...")
            # Upload Asset
            input_asset = pdf_services.upload(
                input_stream=input_stream,
                mime_type=PDFServicesMediaType.DOCX
            )

            logger.debug("Creating job...")
            # Create Job
            create_pdf_job = CreatePDFJob(input_asset)

            # Submit Job
            logger.debug("Submitting job...")
            location = pdf_services.submit(create_pdf_job)

            # Get Result
            logger.debug("Polling result...")
            pdf_services_response = pdf_services.get_job_result(location, CreatePDFResult)
            result_asset = pdf_services_response.get_result().get_asset()

            # Get Content
            logger.debug("Downloading content...")
            stream_asset = pdf_services.get_content(result_asset)

            # Convert to BytesIO
            logger.debug("Converting to BytesIO...")
            input_bytes = stream_asset.get_input_stream()
            logger.debug("input_stream type: %s", type(input_bytes))

            output_stream = io.BytesIO(input_bytes)
            output_stream.seek(0)

            logger.debug("Success! Output size: %s", len(output_stream.getvalue()))
            return output_stream

        except Exception as e:
            logger.debug("EXCEPTION in convert_docx_to_pdf: %s", e)
            import traceback
            traceback.print_exc()
            logger.error(f"Adobe PDF Conversion failed: {e}")
            raise HTTPException(
                status_code=500,
                detail=f"PDF Conversion failed: {str(e)}"
            )

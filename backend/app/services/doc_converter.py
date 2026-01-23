"""DOC to DOCX conversion utility using LibreOffice."""

import os
import subprocess
import tempfile
import uuid
from typing import Tuple


def convert_doc_to_docx(doc_content: bytes, original_filename: str) -> Tuple[bytes, str]:
    """
    Convert a .doc file to .docx using LibreOffice.
    
    Args:
        doc_content: The binary content of the .doc file
        original_filename: Original filename for reference
        
    Returns:
        Tuple of (docx_content as bytes, new filename with .docx extension)
        
    Raises:
        RuntimeError: If conversion fails
    """
    # Create a temp directory for the conversion
    with tempfile.TemporaryDirectory() as temp_dir:
        # Generate unique filename to avoid conflicts
        unique_id = str(uuid.uuid4())[:8]
        base_name = os.path.splitext(original_filename)[0]
        doc_filename = f"{base_name}_{unique_id}.doc"
        doc_path = os.path.join(temp_dir, doc_filename)
        
        # Write the .doc content to a temp file
        with open(doc_path, 'wb') as f:
            f.write(doc_content)
        
        try:
            # Use LibreOffice to convert to DOCX
            result = subprocess.run(
                [
                    'soffice',
                    '--headless',
                    '--convert-to', 'docx',
                    '--outdir', temp_dir,
                    doc_path
                ],
                capture_output=True,
                text=True,
                timeout=60  # 60 second timeout
            )
            
            if result.returncode != 0:
                raise RuntimeError(f"LibreOffice conversion failed: {result.stderr}")
            
            # Find the converted file
            docx_filename = f"{base_name}_{unique_id}.docx"
            docx_path = os.path.join(temp_dir, docx_filename)
            
            if not os.path.exists(docx_path):
                # Try alternative naming (LibreOffice might use original base name)
                for f in os.listdir(temp_dir):
                    if f.endswith('.docx'):
                        docx_path = os.path.join(temp_dir, f)
                        break
                else:
                    raise RuntimeError("Converted DOCX file not found")
            
            # Read the converted content
            with open(docx_path, 'rb') as f:
                docx_content = f.read()
            
            # Return with updated filename
            new_filename = f"{base_name}.docx"
            return docx_content, new_filename
            
        except subprocess.TimeoutExpired:
            raise RuntimeError("Document conversion timed out")
        except FileNotFoundError:
            raise RuntimeError("LibreOffice (soffice) not found. Please install libreoffice-writer.")

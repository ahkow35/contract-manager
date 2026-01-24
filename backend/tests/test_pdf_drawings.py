
import pytest
import fitz  # PyMuPDF
from app.services.pdf_parser import extract_pdf_highlights

@pytest.mark.asyncio
async def test_extract_pdf_highlights_drawings():
    """Test extraction of highlights represented as background drawings."""
    # Create a new PDF
    doc = fitz.open()
    page = doc.new_page()

    # Define a yellow color (RGB)
    yellow = (1, 1, 0)
    
    # 1. DRAWING HIGHLIGHT
    # Draw a yellow rectangle (simulate background highlight)
    rect_drawing = fitz.Rect(100, 100, 300, 120)
    shape = page.new_shape()
    shape.draw_rect(rect_drawing)
    shape.finish(color=None, fill=yellow)  # No border, yellow fill
    shape.commit()

    # Write text over the drawing
    page.insert_text((100, 115), "Background Highlighted Text")

    # 2. STANDARD ANNOTATION HIGHLIGHT
    # Write text first
    page.insert_text((100, 200), "Annotation Highlighted Text")
    # Add highlight annotation
    rect_annot = fitz.Rect(100, 185, 300, 205)
    annot = page.add_highlight_annot(rect_annot)
    annot.set_colors(stroke=yellow)
    annot.update()

    # Save to bytes
    pdf_bytes = doc.tobytes()
    doc.close()

    # Run extraction
    highlights = extract_pdf_highlights(pdf_bytes)

    # Verification
    print(f"Found {len(highlights)} highlights")
    for h in highlights:
        print(f" - {h.original_text}")

    assert len(highlights) >= 2
    
    # Check for drawing text
    texts = [h.original_text for h in highlights]
    assert "Background Highlighted Text" in texts
    assert "Annotation Highlighted Text" in texts

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_extract_pdf_highlights_drawings())

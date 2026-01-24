"""PDF highlight extraction using PyMuPDF."""

import fitz  # PyMuPDF
from typing import List
from io import BytesIO

from app.models.schemas import HighlightedField


def extract_pdf_highlights(content: bytes) -> List[HighlightedField]:
    """
    Extract yellow highlighted text from a PDF document.

    Args:
        content: PDF file content as bytes

    Returns:
        List of highlighted fields with their text and location
    """
    highlights: List[HighlightedField] = []

    try:
        # Open PDF from bytes
        doc = fitz.open(stream=content, filetype="pdf")
        print(f"Analyzing PDF with {len(doc)} pages...")

        for page_num, page in enumerate(doc):
            print(f"Scanning Page {page_num + 1}...")
            
            # 1. Check ANNOTATIONS (Standard PDF Highlights)
            annotations = page.annots()
            if annotations:
                for annot in annotations:
                    print(f"  Found Annotation: Type={annot.type[0]}, Rect={annot.rect}")
                    if annot.type[0] == 8:  # Highlight annotation
                        color = annot.colors.get("stroke", [1, 1, 0])
                        print(f"    - Color: {color}")
                        if _is_yellow(color):
                            _add_highlight(page, page_num, annot.rect, highlights)

            # 2. Check DRAWINGS (Background Rectangles - common in Word exports)
            drawings = page.get_drawings()
            for draw in drawings:
                # Check fill color (non-stroking color)
                if draw["fill"]:
                    # print(f"  Found Drawing: Rect={draw['rect']}, Fill={draw['fill']}")
                    if _is_yellow(draw["fill"]):
                         print(f"    - Yellow Drawing Detected at {draw['rect']}")
                         _add_highlight(page, page_num, draw["rect"], highlights)

        doc.close()

    except Exception as e:
        print(f"ERROR: Failed to parse PDF: {e}")
        raise Exception(f"Failed to parse PDF: {e}")

    print(f"Total highlights found: {len(highlights)}")
    return highlights


def _is_yellow(color: List[float], tolerance: float = 0.4) -> bool: # Increased tolerance
    """Check if a color is approximately yellow."""
    if not color or len(color) < 3:
        return False
    r, g, b = color[:3]
    # Yellow is high red, high green, low blue
    # Relaxed tolerance for 'darker' yellows often found in CMYK->RGB conversions
    return r > 0.6 and g > 0.6 and b < tolerance


def _add_highlight(page, page_num: int, rect, highlights: List[HighlightedField]):
    """Helper to extract text from a rect using intersection to be more robust."""
    # Convert fitz.Rect to ensure we have methods
    highlight_rect = fitz.Rect(rect)
    
    # Use "words" extraction which gives bounding boxes for each word
    # Format: (x0, y0, x1, y1, "word", block_no, line_no, word_no)
    words = page.get_text("words")
    
    extracted_words = []
    
    for w in words:
        word_rect = fitz.Rect(w[0], w[1], w[2], w[3])
        word_text = w[4]
        
        # Check for intersection
        # If the word intersects significantly with the highlight rect, include it
        if highlight_rect.intersects(word_rect):
            # Calculate intersection area
            intersect = highlight_rect & word_rect
            # If intersection covers > 30% of the word height (approx), count it
            # Or just simple intersection is usually enough for highlights
            if intersect.height > (word_rect.height * 0.3):
                extracted_words.append(word_text)
    
    # Reconstruct text
    text = " ".join(extracted_words).strip()
    
    if text:
        # Avoid exact duplicates on the same page
        for existing in highlights:
            if existing.page == page_num + 1 and existing.original_text == text:
                return

        highlights.append(
            HighlightedField(
                id=f"field_{page_num}_{len(highlights)}",
                original_text=text,
                page=page_num + 1,
                rect={
                    "x0": highlight_rect.x0,
                    "y0": highlight_rect.y0,
                    "x1": highlight_rect.x1,
                    "y1": highlight_rect.y1,
                },
            )
        )

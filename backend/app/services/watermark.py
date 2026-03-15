"""
Watermark service for HighlightEdit.

Adds a branded footer paragraph to DOCX documents for free-tier users.
The footer appears at the end of the document body (not in the Word header),
so it survives DOCX → PDF conversion via Adobe PDF Services.
"""
from pathlib import Path
from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

# Path to the logo PNG for inline embedding (optional — text-only fallback if absent)
_STATIC_DIR = Path(__file__).parent.parent / "static"
_LOGO_PNG = _STATIC_DIR / "logo.png"


def add_watermark(doc: Document, text: str = "Made with HighlightEdit") -> Document:
    """
    Append a branded footer paragraph to the document.

    Replaces the previous diagonal VML header watermark.
    The footer is added to the document body so it appears in both
    DOCX and PDF (via Adobe PDF Services DOCX→PDF conversion).

    Args:
        doc: python-docx Document object (modified in place)
        text: unused, kept for backwards-compatible signature

    Returns:
        The modified Document object.
    """
    _add_horizontal_rule(doc)

    footer_para = doc.add_paragraph()
    footer_para.alignment = WD_ALIGN_PARAGRAPH.LEFT
    footer_para.paragraph_format.space_before = Pt(4)
    footer_para.paragraph_format.space_after = Pt(0)

    # Optionally embed the logo as a small inline image
    if _LOGO_PNG.exists():
        try:
            run = footer_para.add_run()
            run.add_picture(str(_LOGO_PNG), width=Pt(10))
            footer_para.add_run("  ")
        except Exception:
            pass  # Logo image failed — continue with text-only footer

    run_prefix = footer_para.add_run("Created with ")
    run_prefix.font.size = Pt(9)
    run_prefix.font.color.rgb = RGBColor(107, 114, 128)  # #6B7280

    run_brand = footer_para.add_run("HighlightEdit")
    run_brand.font.size = Pt(9)
    run_brand.font.bold = True
    run_brand.font.color.rgb = RGBColor(55, 65, 81)  # #374151

    run_suffix = footer_para.add_run(" \u00b7 Free Plan \u00b7 highlightedit.com")
    run_suffix.font.size = Pt(9)
    run_suffix.font.color.rgb = RGBColor(107, 114, 128)  # #6B7280

    return doc


def _add_horizontal_rule(doc: Document) -> None:
    """Append a paragraph with a bottom border (renders as HR in Word/PDF)."""
    rule_para = doc.add_paragraph()
    rule_para.paragraph_format.space_before = Pt(12)
    rule_para.paragraph_format.space_after = Pt(0)

    pPr = rule_para._p.get_or_add_pPr()
    pBdr = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), "6")
    bottom.set(qn("w:space"), "1")
    bottom.set(qn("w:color"), "E5E7EB")
    pBdr.append(bottom)
    pPr.append(pBdr)

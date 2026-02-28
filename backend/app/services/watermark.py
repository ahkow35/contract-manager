"""
Watermark Service

Adds a diagonal text watermark to DOCX documents for free-tier users.
Uses Word's built-in VML shape watermark in the document header so it
appears on every page and carries through to PDF conversion.
"""

from docx import Document
from docx.oxml.ns import qn, nsmap
from lxml import etree


# VML watermark shape XML template.
# This creates a semi-transparent diagonal "Made with HighlightEdit" text across each page.
_WATERMARK_XML = """
<v:shapetype id="_x0000_t136" coordsize="21600,21600"
    o:spt="136" adj="10800"
    path="m@7,l@8,m@5,21600l@6,21600e"
    xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office">
    <v:formulas>
        <v:f eqn="sum #0 0 10800"/>
        <v:f eqn="prod #0 2 1"/>
        <v:f eqn="sum 21600 0 @1"/>
        <v:f eqn="sum 0 0 @2"/>
        <v:f eqn="sum 21600 0 @3"/>
        <v:f eqn="if @0 @3 0"/>
        <v:f eqn="if @0 21600 @1"/>
        <v:f eqn="if @0 0 @2"/>
        <v:f eqn="if @0 @4 21600"/>
        <v:f eqn="mid @5 @6"/>
        <v:f eqn="mid @8 @5"/>
        <v:f eqn="mid @7 @8"/>
        <v:f eqn="mid @6 @7"/>
        <v:f eqn="sum @6 0 @5"/>
    </v:formulas>
    <v:path textpathok="t" o:connecttype="custom"
        o:connectlocs="@9,0;@10,10800;@11,21600;@12,10800"
        o:connectangles="270,180,90,0"/>
    <v:textpath on="t" fitshape="t"/>
    <v:handles>
        <v:h position="#0,bottomRight" xrange="6629,14971"/>
    </v:handles>
    <o:lock v:ext="edit" text="t" shapetype="t"/>
</v:shapetype>
"""

_WATERMARK_SHAPE_TEMPLATE = """
<v:shape id="PowerPlusWaterMarkObject"
    o:spid="_x0000_s2049" type="#_x0000_t136"
    style="position:absolute;margin-left:0;margin-top:0;width:527.85pt;height:131.95pt;rotation:315;z-index:-251656192;mso-position-horizontal:center;mso-position-horizontal-relative:margin;mso-position-vertical:center;mso-position-vertical-relative:margin"
    o:allowincell="f" fillcolor="silver" stroked="f"
    xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:w10="urn:schemas-microsoft-com:office:word">
    <v:fill opacity=".25"/>
    <v:textpath style="font-family:&quot;Calibri&quot;;font-size:1pt"
        string="{text}"/>
    <w10:wrap anchorx="margin" anchory="margin"/>
</v:shape>
"""


def add_watermark(doc: Document, text: str = "Made with HighlightEdit") -> Document:
    """
    Add a diagonal text watermark to every page of the document.
    
    Inserts a VML shape into the default header of each section.
    The watermark is semi-transparent and centered diagonally.
    
    Args:
        doc: python-docx Document object (will be modified in place)
        text: Watermark text to display
        
    Returns:
        The modified Document object
    """
    # Parse the shapetype and shape XML
    shapetype_elem = etree.fromstring(_WATERMARK_XML.strip())
    shape_xml = _WATERMARK_SHAPE_TEMPLATE.format(text=text).strip()
    shape_elem = etree.fromstring(shape_xml)

    for section in doc.sections:
        # Force Word to use even/odd/default headers so the default header is active
        section.different_first_page_header_footer = False
        
        # Get or create the default header
        header = section.header
        header.is_linked_to_previous = False
        
        # Create the watermark paragraph with the VML shape
        # We need a <w:p> containing a <w:r> containing a <w:pict> with our VML
        p = header._element.makeelement(qn('w:p'), {})
        r = header._element.makeelement(qn('w:r'), {})
        pict = header._element.makeelement(qn('w:pict'), {})
        
        # Add the shapetype definition (only need it once, but harmless to repeat)
        pict.append(shapetype_elem.__deepcopy__(True))
        # Add the actual shape
        pict.append(shape_elem.__deepcopy__(True))
        
        r.append(pict)
        p.append(r)
        
        # Insert at the beginning of the header
        header._element.insert(0, p)

    return doc

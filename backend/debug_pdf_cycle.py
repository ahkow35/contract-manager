
import os
import sys
import asyncio
from app.services.template_creator import create_template
from app.services.document_generator import generate_pdf

# Mock file content (a simple empty PDF)
import fitz
def create_dummy_pdf():
    doc = fitz.open()
    page = doc.new_page()
    # Draw a yellow highlight (drawing)
    page.draw_rect(fitz.Rect(100, 100, 200, 120), color=None, fill=(1, 1, 0))
    page.insert_text((100, 115), "My Field")
    return doc.tobytes()

def test_cycle():
    print("1. Creating Dummy PDF...")
    raw_pdf = create_dummy_pdf()
    
    print("2. Running create_template...")
    try:
        template_state = create_template(raw_pdf, "test_doc.pdf", ".")
        template_path = template_state.template_file_path
        print(f"   Template created at: {template_path}")
        print(f"   Fields detected: {len(template_state.fields)}")
        if len(template_state.fields) == 0:
            print("   WARNING: No fields detected! This will fail generation testing.")
            
    except Exception as e:
        print(f"   ERROR in create_template: {e}")
        return

    print("3. Running generate_pdf...")
    try:
        # Construct field values
        field_values = {f"field_{f.id}": f"VALUE_FOR_{f.id}" for f in template_state.fields}
        print(f"   Input values: {field_values}")
        
        output_path = "final_output.pdf"
        generate_pdf(template_path, field_values, output_path)
        print(f"   Success! Output at {output_path}")
        
        # Verify content
        doc_out = fitz.open(output_path)
        page_out = doc_out[0]
        text_out = page_out.get_text()
        print(f"   Extracted Text from Output: {text_out.strip()}")
        
        expected_value = "VALUE_FOR_1"
        if expected_value in text_out:
             print("   VERIFICATION PASSED: New value found in output.")
        else:
             print("   VERIFICATION FAILED: New value NOT found in output.")
             
        doc_out.close()
        
    except Exception as e:
        print(f"   ERROR in generate_pdf: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_cycle()

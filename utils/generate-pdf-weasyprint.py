#!/usr/bin/env python3
"""
Generate PDF from HTML resume using WeasyPrint
This is a backup option if browser Print-to-PDF doesn't work well.

Usage:
    python generate-pdf-weasyprint.py

Requirements:
    pip install weasyprint pyyaml
"""

import yaml
import sys
from pathlib import Path

try:
    from weasyprint import HTML, CSS
except ImportError:
    print("Error: WeasyPrint not installed")
    print("Install with: pip install -r requirements.txt")
    sys.exit(1)


def load_yaml(yaml_path):
    """Load and parse YAML file"""
    with open(yaml_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


def escape_html(text):
    """Escape HTML special characters"""
    if text is None:
        return ''
    return (str(text)
            .replace('&', '&amp;')
            .replace('<', '&lt;')
            .replace('>', '&gt;')
            .replace('"', '&quot;')
            .replace("'", '&#39;'))


def render_header(info):
    """Render header section"""
    contact_items = [
        info.get('location', ''),
        f'<a href="mailto:{info.get("email", "")}">{info.get("email", "")}</a>',
        f'<a href="https://{info.get("linkedin", "")}">{info.get("linkedin", "")}</a>',
        f'<a href="https://{info.get("github", "")}">{info.get("github", "")}</a>'
    ]
    contact_items = [item for item in contact_items if item]
    
    return f"""
        <div class="header">
            <h1>{escape_html(info.get('name', ''))}</h1>
            <div class="subtitle">{escape_html(info.get('full_name', ''))}</div>
            <div class="contact-info">
                {' | '.join(contact_items)}
            </div>
        </div>
    """


def render_education(education, section_name):
    """Render education section"""
    section_title = education.get('_title', 'Education')
    labels = education.get('_labels', {})
    items = education.get('items', [])
    
    item_htmls = []
    for edu in items:
        campus = f" - {escape_html(edu.get('campus', ''))}" if edu.get('campus') else ''
        item_htmls.append(f"""
            <div class="education-item">
                <span class="date">{escape_html(edu.get('graduation_date', ''))}</span>
                <div class="degree">{escape_html(edu.get('degree', ''))}</div>
                <div class="institution">
                    {escape_html(edu.get('institution', ''))}{campus}
                </div>
            </div>
        """)
    
    return f"""
        <div class="section">
            <h2 class="section-title">{escape_html(section_title)}</h2>
            {''.join(item_htmls)}
        </div>
    """


def render_skills(skills, section_name):
    """Render skills section with new structure"""
    # Get section title from _title field
    section_title = skills.get('_title', 'Skills')
    
    html = f'<div class="section"><h2 class="section-title">{escape_html(section_title)}</h2>'
    
    # Iterate through categories
    for category_key, category_data in skills.items():
        # Skip metadata fields
        if category_key.startswith('_'):
            continue
        
        # Check if category has required structure
        if not isinstance(category_data, dict):
            continue
        
        category_title = category_data.get('_title')
        category_items = category_data.get('_items')
        
        if not category_title or not isinstance(category_items, list) or len(category_items) == 0:
            continue
        
        skills_list = ', '.join(escape_html(s) for s in category_items)
        html += f"""
            <div class="skills-category">
                <strong>{escape_html(category_title)}:</strong>
                <span class="skills-list">{skills_list}</span>
            </div>
        """
    
    html += '</div>'
    return html


def render_work_experience(work, section_name):
    """Render work experience section"""
    section_title = work.get('_title', 'Work Experience')
    labels = work.get('_labels', {})
    items = work.get('items', [])
    
    item_htmls = []
    for exp in items:
        responsibilities = ''
        if exp.get('responsibilities'):
            resp_items = ''.join(f'<li>{escape_html(r)}</li>' for r in exp['responsibilities'])
            responsibilities = f'<ul class="responsibilities">{resp_items}</ul>'
        
        item_htmls.append(f"""
            <div class="experience-item">
                <div class="experience-header">
                    <div>
                        <span class="job-title">{escape_html(exp.get('title', ''))}</span>
                        <span class="company"> || {escape_html(exp.get('company', ''))}</span>
                    </div>
                    <div class="duration">{escape_html(exp.get('duration', ''))}</div>
                </div>
                {responsibilities}
            </div>
        """)
    
    return f"""
        <div class="section">
            <h2 class="section-title">{escape_html(section_title)}</h2>
            {''.join(item_htmls)}
        </div>
    """


def render_research_experience(research, section_name):
    """Render research experience section"""
    section_title = research.get('_title', 'Research Experience')
    labels = research.get('_labels', {
        'technical_environment': 'Technical Environment',
        'applied_methods': 'Applied Methods'
    })
    items = research.get('items', [])
    
    item_htmls = []
    for exp in items:
        references = f" {escape_html(exp.get('references', ''))}" if exp.get('references') else ''
        exp_type = f" | {escape_html(exp.get('type', ''))}" if exp.get('type') else ''
        
        description = ''
        if exp.get('description'):
            description = f'<div class="research-description">{escape_html(exp["description"])}</div>'
        
        tech_env = ''
        if exp.get('technical_environment'):
            tech_label = escape_html(labels.get('technical_environment', 'Technical Environment'))
            tech_env = f'<div class="applied-methods"><em>{tech_label}:</em> {escape_html(exp["technical_environment"])}</div>'
        
        methods = ''
        if exp.get('applied_methods'):
            methods_label = escape_html(labels.get('applied_methods', 'Applied Methods'))
            methods_list = ' | '.join(escape_html(m) for m in exp['applied_methods'])
            methods = f'<div class="applied-methods"><em>{methods_label}:</em> <span class="methods-list"> {methods_list}</span></div>'
        
        item_htmls.append(f"""
            <div class="research-item">
                <div class="research-title">{escape_html(exp.get('title', ''))}{references}</div>
                <div class="research-type">{escape_html(exp.get('institution', ''))}{exp_type}</div>
                {description}
                {tech_env}
                {methods}
            </div>
        """)
    
    return f"""
        <div class="section">
            <h2 class="section-title">{escape_html(section_title)}</h2>
            {''.join(item_htmls)}
        </div>
    """


def render_certificates(certificates, section_name):
    """Render certificates section"""
    section_title = certificates.get('_title', 'Certificates')
    labels = certificates.get('_labels', {
        'verification_url': 'Verify at'
    })
    items = certificates.get('items', [])
    
    item_htmls = []
    for cert in items:
        verify_link = ''
        if cert.get('verification_url'):
            verify_label = escape_html(labels.get('verification_url', 'Verify at'))
            verify_link = f'<a href="{cert["verification_url"]}" class="certificate-link">{verify_label} {cert["verification_url"]}</a>'
        
        item_htmls.append(f"""
            <div class="certificate-item">
                <div class="certificate-name">{escape_html(cert.get('name', ''))}</div>
                <div class="certificate-institution">{escape_html(cert.get('institution', ''))}</div>
                {verify_link}
            </div>
        """)
    
    return f"""
        <div class="section">
            <h2 class="section-title">{escape_html(section_title)}</h2>
            {''.join(item_htmls)}
        </div>
    """


def render_publications(publications, section_name):
    """Render publications section"""
    section_title = publications.get('_title', 'Publications')
    labels = publications.get('_labels', {
        'scholar_url': 'Google Scholar Profile'
    })
    
    note = ''
    if publications.get('note'):
        note = f'<div class="publications-note">{escape_html(publications["note"])}</div>'
    
    scholar = ''
    if publications.get('scholar_url'):
        scholar_label = escape_html(labels.get('scholar_url', 'Google Scholar Profile'))
        scholar = f'<a href="{publications["scholar_url"]}" class="publications-link">{scholar_label}</a>'
    
    return f"""
        <div class="section">
            <h2 class="section-title">{escape_html(section_title)}</h2>
            {note}
            {scholar}
        </div>
    """


def generate_html(data):
    """Generate complete HTML from YAML data"""
    # Read CSS file
    css_path = Path('style.css')
    if not css_path.exists():
        print("Warning: style.css not found, using minimal styles")
        css_content = ""
    else:
        with open(css_path, 'r', encoding='utf-8') as f:
            css_content = f.read()
    
    # Build HTML sections
    html_sections = []
    
    # Header
    html_sections.append(render_header(data.get('personal_info', {})))
    
    # Summary
    if data.get('summary'):
        html_sections.append(f"""
            <div class="section">
                <h2 class="section-title">Summary</h2>
                <p class="summary">{escape_html(data['summary'])}</p>
            </div>
        """)
    
    # Education
    if data.get('education'):
        html_sections.append(render_education(data['education']))
    
    # Skills
    if data.get('skills'):
        html_sections.append(render_skills(data['skills']))
    
    # Work Experience
    if data.get('work_experience'):
        html_sections.append(render_work_experience(data['work_experience']))
    
    # Research Experience
    if data.get('research_experience'):
        html_sections.append(render_research_experience(data['research_experience']))
    
    # Certificates
    if data.get('certificates'):
        html_sections.append(render_certificates(data['certificates']))
    
    # Publications
    if data.get('publications'):
        html_sections.append(render_publications(data['publications']))
    
    # Complete HTML document
    html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>{escape_html(data.get('personal_info', {}).get('name', 'Resume'))}</title>
        <style>
            {css_content}
            
            /* Additional print-specific styles for WeasyPrint */
            body {{
                background: white;
                padding: 0;
            }}
            
            #resume-container {{
                max-width: 100%;
                box-shadow: none;
                padding: 0.5in;
            }}
            
            @page {{
                margin: 0.5in;
                size: letter;
            }}
        </style>
    </head>
    <body>
        <div id="resume-container">
            {''.join(html_sections)}
        </div>
    </body>
    </html>
    """
    
    return html


def main():
    """Main function to generate PDF"""
    yaml_path = Path('resume.yml')
    output_path = Path('resume.pdf')
    
    # Check if YAML file exists
    if not yaml_path.exists():
        print(f"Error: {yaml_path} not found")
        print("Make sure resume.yml is in the current directory")
        sys.exit(1)
    
    print("Loading resume data...")
    data = load_yaml(yaml_path)
    
    print("Generating HTML...")
    html_content = generate_html(data)
    
    print("Generating PDF...")
    try:
        HTML(string=html_content).write_pdf(output_path)
        print(f"✓ PDF generated successfully: {output_path}")
    except Exception as e:
        print(f"Error generating PDF: {e}")
        print("\nTroubleshooting:")
        print("1. Ensure WeasyPrint is installed: pip install weasyprint")
        print("2. WeasyPrint requires additional system dependencies:")
        print("   - Ubuntu/Debian: sudo apt-get install python3-dev python3-pip python3-setuptools python3-wheel python3-cffi libcairo2 libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf2.0-0 libffi-dev shared-mime-info")
        print("   - macOS: brew install cairo pango gdk-pixbuf libffi")
        print("   - Windows: See https://doc.courtbouillon.org/weasyprint/stable/first_steps.html#windows")
        sys.exit(1)


if __name__ == '__main__':
    main()
#!/usr/bin/env python3
"""
Consolidate resume formatter files into a single all.html file.

This script reads index.html, style.css, resume.js, and resume.yml,
then creates a self-contained all.html file with all resources embedded inline.
"""

import os
import sys
from pathlib import Path


def read_file(filepath):
    """Read file content with error handling."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        print(f"Error: File '{filepath}' not found.", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error reading '{filepath}': {e}", file=sys.stderr)
        sys.exit(1)


def escape_for_js_template_literal(text):
    """Escape text for embedding in JavaScript template literal (backticks)."""
    # Escape backticks and backslashes
    text = text.replace('\\', '\\\\')  # Escape backslashes first
    text = text.replace('`', '\\`')     # Escape backticks
    text = text.replace('${', '\\${')   # Escape template literal placeholders
    return text


def consolidate():
    """Main consolidation function."""
    # Get script directory
    script_dir = Path(__file__).parent

    # Define file paths
    files = {
        'index': script_dir / 'index.html',
        'style': script_dir / 'style.css',
        'script': script_dir / 'resume.js',
        'yaml': script_dir / 'resume.yml'
    }

    # Check if all files exist
    missing_files = [name for name, path in files.items() if not path.exists()]
    if missing_files:
        print(f"Error: Missing files: {', '.join(missing_files)}", file=sys.stderr)
        print(f"Current directory: {script_dir}", file=sys.stderr)
        sys.exit(1)

    print("Reading source files...")

    # Read all files
    index_html = read_file(files['index'])
    style_css = read_file(files['style'])
    resume_js = read_file(files['script'])
    resume_yml = read_file(files['yaml'])

    print(f"  ✓ Read {files['index'].name} ({len(index_html)} chars)")
    print(f"  ✓ Read {files['style'].name} ({len(style_css)} chars)")
    print(f"  ✓ Read {files['script'].name} ({len(resume_js)} chars)")
    print(f"  ✓ Read {files['yaml'].name} ({len(resume_yml)} chars)")

    # Extract the body content from index.html (everything between <body> and </body>)
    body_start = index_html.find('<body>')
    body_end = index_html.find('</body>')

    if body_start == -1 or body_end == -1:
        print("Error: Could not find <body> tags in index.html", file=sys.stderr)
        sys.exit(1)

    body_content = index_html[body_start + len('<body>'):body_end].strip()

    # Remove any script src references from body (we'll embed everything)
    import re
    body_content = re.sub(r'<script\s+src=["\']resume\.js["\']\s*>\s*</script>', '', body_content)

    # Extract head content for meta tags and CDN links
    head_start = index_html.find('<head>')
    head_end = index_html.find('</head>')

    if head_start == -1 or head_end == -1:
        print("Error: Could not find <head> tags in index.html", file=sys.stderr)
        sys.exit(1)

    head_content = index_html[head_start + len('<head>'):head_end].strip()

    # Extract only the meta tags and CDN links from head (not the link to style.css or script src)
    head_lines = []
    for line in head_content.split('\n'):
        line = line.strip()
        # Include meta tags, title, and CDN links
        if (line.startswith('<meta') or
            line.startswith('<title') or
            'cdn.jsdelivr.net' in line or
            'cdnjs.cloudflare.com' in line):
            head_lines.append('    ' + line)

    head_includes = '\n'.join(head_lines)

    # Prepare YAML data for embedding (escape for JavaScript template literal)
    yaml_escaped = escape_for_js_template_literal(resume_yml)

    # Modify resume.js to use embedded YAML data instead of fetching
    import re

    modified_js = resume_js

    # First, remove the old variable declarations from resume.js
    # This appears at the very beginning of the file
    modified_js = re.sub(
        r'^// Store the original YAML text globally\s*\nlet originalYamlText = \'\';?\s*\n+',
        '',
        modified_js
    )

    # Replace the entire fetch block in loadResume function
    # Match from "// Fetch the YAML file" through "let yamlText = await response.text();"
    fetch_block_pattern = r"([ \t]*)// Fetch the YAML file\s*\n\s*const response = await fetch\('resume\.yml'\);.*?\n.*?let yamlText = await response\.text\(\);"
    replacement = r"\1let yamlText = YAML_DATA;"
    modified_js = re.sub(fetch_block_pattern, replacement, modified_js, flags=re.DOTALL)

    # Remove the "Store original YAML text" assignment line inside loadResume if it appears
    modified_js = re.sub(
        r'\n\s+// Store original YAML text\s*\n\s+originalYamlText = yamlText;',
        '',
        modified_js
    )

    # Remove the error message about running a local server since it's no longer needed
    modified_js = re.sub(
        r"<p>Make sure you're running a local server:</p>\s*\n\s*<p><strong>VSCode:</strong>.*?</p>\s*\n\s*<p><strong>Command line:</strong>.*?</p>\s*\n\s*<p>Then open:.*?</p>",
        '',
        modified_js,
        flags=re.DOTALL
    )

    # Add YAML_DATA constant and global variables at the beginning of the script
    yaml_constant = f"""// YAML data embedded inline
const YAML_DATA = `{yaml_escaped}`;

// Store the original YAML text globally
let originalYamlText = YAML_DATA;

"""
    modified_js = yaml_constant + modified_js

    print("\nGenerating consolidated HTML...")

    # Build the complete HTML document
    consolidated_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
{head_includes}

    <style>
{style_css}
    </style>
</head>
<body>
{body_content}

    <script>
{modified_js}
    </script>
</body>
</html>
"""

    # Write output file
    output_path = script_dir / 'all.html'

    try:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(consolidated_html)
        print(f"\n✓ Successfully created {output_path.name}")
        print(f"  File size: {len(consolidated_html):,} bytes")
        print(f"\nYou can now open '{output_path.name}' directly in your browser!")
        print("No server required - it's completely self-contained.")
    except Exception as e:
        print(f"Error writing output file: {e}", file=sys.stderr)
        sys.exit(1)


def main():
    """Entry point."""
    print("=" * 60)
    print("Resume Formatter Consolidation Script")
    print("=" * 60)
    print()

    consolidate()

    print()
    print("=" * 60)


if __name__ == '__main__':
    main()

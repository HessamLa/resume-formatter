# Resume Consolidation Script

## Overview

`consolidate.py` is a Python script that combines all resume formatter files into a single, self-contained `all.html` file.

## What it does

The script reads the following source files:
- `index.html` - The HTML structure
- `style.css` - All styling
- `resume.js` - JavaScript functionality
- `resume.yml` - Resume data

And creates:
- `all.html` - A single file with everything embedded inline

## Usage

```bash
python3 consolidate.py
```

Or if you made it executable:

```bash
./consolidate.py
```

## Output

The script creates `all.html` which:
- Contains all CSS embedded in a `<style>` tag
- Contains all JavaScript embedded in a `<script>` tag
- Contains resume YAML data embedded as a JavaScript constant
- Can be opened directly in a browser without a server
- Still requires internet connection for CDN resources (KaTeX and js-yaml)

## Requirements

- Python 3.x
- Source files must be in the same directory as the script:
  - `index.html`
  - `style.css`
  - `resume.js`
  - `resume.yml`

## Features

- Automatically escapes YAML data for JavaScript embedding
- Removes external script references (except CDN links)
- Preserves all meta tags and CDN dependencies
- Shows progress and file size information
- Provides helpful error messages

## Example Output

```
============================================================
Resume Formatter Consolidation Script
============================================================

Reading source files...
  ✓ Read index.html (3781 chars)
  ✓ Read style.css (20651 chars)
  ✓ Read resume.js (33127 chars)
  ✓ Read resume.yml (11045 chars)

Generating consolidated HTML...

✓ Successfully created all.html
  File size: 68,556 bytes

You can now open 'all.html' directly in your browser!
No server required - it's completely self-contained.

============================================================
```

## Use Cases

- **Distribution**: Share a single file instead of multiple files
- **Portability**: Open the resume on any computer without setup
- **Archiving**: Keep a snapshot of your resume in one file
- **Quick viewing**: Double-click to open without running a server

## Notes

- The script modifies `resume.js` to use embedded YAML data instead of fetching `resume.yml`
- External CDN dependencies (KaTeX and js-yaml) are preserved
- The generated file is larger than the sum of parts due to text encoding

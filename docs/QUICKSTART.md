# Quick Start Guide

## For VSCode Users (Recommended)

### First Time Setup
1. Install "Live Preview" extension (`Ctrl+Shift+X`)
2. Search "Live Preview" by Microsoft
3. Click Install

### Daily Workflow
```
1. Open project folder in VSCode
2. Right-click index.html → "Show Preview"
   OR press Ctrl+Shift+V
3. Edit resume.yml
4. Save (Ctrl+S) - preview auto-refreshes
5. When ready: Ctrl+P → Save as PDF
```

## For Non-VSCode Users

### Daily Workflow
```
1. Open terminal in project folder
2. Run: python -m http.server 8000
3. Open browser: http://localhost:8000
4. Edit resume.yml
5. Save and manually refresh browser
6. When ready: Ctrl+P → Save as PDF
```

## Generate PDF

### Method 1: Browser (Easy)
1. Open resume in browser
2. `Ctrl+P` (Windows) or `Cmd+P` (Mac)
3. Destination: "Save as PDF"
4. **Important Settings:**
   - ✅ Enable "Background graphics"
   - ✅ Margins: Default
   - ✅ Scale: 100%
5. Click Save

### Method 2: Automated (Optional)
```bash
# One-time setup
pip install -r requirements.txt

# Generate PDF
python generate-pdf-weasyprint.py
```

## Troubleshooting

### "Failed to load resume.yml"
✅ **VSCode**: Use Live Preview (right-click → Show Preview)  
✅ **Other**: Run `python -m http.server 8000`  
❌ **Don't**: Open index.html directly (file:// causes CORS errors)

### PDF looks wrong
1. Use Chrome or Edge
2. Check "Background graphics" is enabled
3. Set margins to "Default"
4. Try print preview first

### Live Preview not working
1. Check extension is installed
2. Try `Ctrl+Shift+P` → "Live Preview: Show Preview"
3. Check VSCode output panel for errors

## File Structure
```
resume.yml        ← Edit this with your data
                    Each section needs _type and _title fields!
index.html        ← Don't edit (unless customizing)
style.css         ← Edit for styling changes
resume.js         ← Don't edit (unless adding features)
```

## YAML Section Format

**Every section must have:**
```yaml
section_name:
  _type: section_type    # Required: contact, summary, education, skills, work, research, certificates, publications
  _title: Display Title  # Required: What shows as section heading (except contact)
  _labels:               # Optional: Customize field labels
    field_name: Custom Label
  # ... your data
```

## Text Formatting (NEW!)

**Use markdown-style formatting in long text fields:**

```yaml
# Bold: **text**
# Italic: *text*
# Underline: __text__

summary:
  _type: summary
  _title: Summary
  content: |
    **Seeking** a role in *Data science* or __Machine Learning__.

work_experience:
  items:
    - responsibilities:
        - Improved **system performance** by *40%*
        - Deployed __production-ready__ ML models
```

**Works in:** Summary content, responsibilities, research descriptions, publication notes
**Doesn't work in:** Names, titles, dates, skills (by design - prevents breaking "C++" etc.)

**Skills section format (NEW):**
```yaml
core_skills:
  _type: skills
  _title: Core Technical Skills
  
  category_name:
    _title: Category Display Name  # Required
    _items:                        # Required - must be array
      - Skill 1
      - Skill 2

# Example:
technical_skills:
  _type: skills
  _title: Technical Skills
  
  languages:
    _title: Programming Languages
    _items:
      - Python
      - JavaScript
      - Go
  
  frameworks:
    _title: Frameworks
    _items:
      - React
      - Django
```

**Other sections with custom labels:**
```yaml
work_experience:
  _type: work
  _title: Professional Experience
  _labels:                      # Optional
    title: Position
    company: Organization
    duration: Period
    responsibilities: Key Achievements
  items:
    - title: Senior Engineer
      company: Tech Corp
      duration: Jan 2023 - Present
      responsibilities:
        - Achievement 1
        - Achievement 2
```

## Common Tasks

### Change Section Order
Just reorder sections in `resume.yml` - YAML order = display order

### Add Multiple Skills Sections
```yaml
technical_skills:
  _type: skills
  _title: Technical Skills
  # ...

soft_skills:
  _type: skills
  _title: Soft Skills  
  # ...
```

### Rename a Section
Change the `_title` field:
```yaml
work_experience:
  _type: work
  _title: Professional Experience  # ← Changed title
  # ...
```

### Remove a Section
Just delete it from `resume.yml`

### Change Colors
Edit `style.css` - look for color codes like `#2c3e50`

### Create Short Version
1. Copy `resume.yml` → `resume-short.yml`
2. Remove unwanted sections (keep `_type` and `_title` in remaining sections)
3. Rename file to `resume.yml` or update `resume.js` to load different file

---

**Need more details?** See [README.md](README.md) for full documentation.
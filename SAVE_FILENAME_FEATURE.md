# Save Filename Feature

## Overview

The resume formatter now supports customizable filenames when saving resumes via the "Save as HTML" or "Save as PDF" buttons.

## How it Works

### YAML Configuration

Add `save_filename` to the `_meta` section of your [resume.yml](resume.yml):

```yaml
_meta:
  save_filename: Hessam-Alizadeh-resume  # Base filename (without extension)
  sections_order: [...]
  job_summary: "..."
```

### Examples

```yaml
# General resume
save_filename: Hessam-Alizadeh-resume

# Job-specific resumes
save_filename: ml-engineer-google
save_filename: senior-devops-aws
save_filename: data-scientist-netflix
save_filename: ai-researcher-meta
```

## Default Behavior

If `save_filename` is not specified in the YAML, the default filename is:
- `Hessam-Alizadeh-resume.html` for HTML exports
- Browser default for PDF exports

## File Naming Convention

**Recommended format:** Use 2-4 keywords separated by hyphens:
- `{role}-{company}`
- `{role}-{specialty}-{company}`
- `{seniority}-{role}-{location}-{company}`

**Examples:**
- `ml-vision-google`
- `senior-devops-ny-startup`
- `data-scientist-healthcare-mayo`
- `ai-nlp-researcher-stanford`

## Technical Implementation

### Code Changes

1. **[resume.js](resume.js:4-5)** - Added global variable to store parsed resume data:
   ```javascript
   let globalResumeData = null;
   ```

2. **[resume.js](resume.js:28-29)** - Store data globally when loading:
   ```javascript
   globalResumeData = data;
   ```

3. **[resume.js](resume.js:770-775)** - Use filename from YAML in saveAsHTML:
   ```javascript
   let baseFilename = 'Hessam-Alizadeh-resume';
   if (globalResumeData && globalResumeData._meta && globalResumeData._meta.save_filename) {
       baseFilename = globalResumeData._meta.save_filename;
   }
   const filename = baseFilename + '.html';
   ```

4. **[resume.js](resume.js:977-978)** - Update global data when YAML editor changes:
   ```javascript
   globalResumeData = data;
   ```

### Consolidation Script

The [consolidate.py](consolidate.py) script has been updated to:
- Remove the old `globalResumeData` declaration from source
- Add it to the embedded constants section
- Ensure it's available in the consolidated `all.html`

## Usage

### Via index.html (with server)

1. Edit `_meta.save_filename` in [resume.yml](resume.yml)
2. Reload the page
3. Click "Save as HTML" or "Save as PDF"
4. File downloads with your custom filename

### Via all.html (standalone)

1. Open [all.html](all.html) in browser
2. Click "YAML" to expand the editor
3. Edit `_meta.save_filename` in the YAML editor
4. Wait 500ms for auto-reload
5. Click "Save as HTML" or "Save as PDF"
6. File downloads with your custom filename

## Benefits

✅ **Job-specific resumes** - Easily identify which resume was sent where
✅ **Version tracking** - Include version identifiers in filenames
✅ **Organization** - Better file management when applying to multiple positions
✅ **Professionalism** - Contextual filenames instead of generic "Resume.html"

## Notes

- The filename is read from the parsed YAML data, not from the filename itself
- Changes in the YAML editor update the filename in real-time
- The `.html` or `.pdf` extension is added automatically
- Special characters in filenames are preserved (test before production use)

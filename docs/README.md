# Resume Generator

**Your Resume, Without the Headache**

Tired of fighting with Word to make your resume look professional? This tool does the formatting for you—just fill in your information and get a polished PDF resume in minutes.

## What You Get

**You write this in a simple text file:**
```yaml
name: Jane Smith
summary: Software engineer with 5 years experience
work_experience:
  - title: Senior Engineer
    company: Tech Corp
    responsibilities:
      - Built cool features
      - Led a team of 5
```

**You get this:**
A beautifully formatted PDF resume, ready to send to employers. No design skills needed!

---

## Why Use This?

**Instead of Word or Google Docs:**

- ✨ **No formatting fights** - The styling is already done for you
- 🎯 **Focus on content** - Just write your experience, not wrestle with margins
- 🔄 **Easy updates** - Change your info in one place, instantly see the results
- 📄 **Perfect PDFs every time** - No "why does this look different when I print it?" moments
- 🎨 **Consistent professional look** - Works for any industry
- 🔀 **Multiple versions** - Easily create different resumes for different jobs

**Perfect for:**

- 👨‍💼 Job seekers who want a clean resume without design skills
- 🎓 Academics maintaining CVs with publications and research
- 💻 Developers/tech folks who prefer text files over Word
- 🔄 Anyone who updates their resume frequently
- 🎯 People applying to different roles (academic vs. industry, etc.)

---

## What Makes This Special?

Unlike rigid templates, this tool gives you **control and flexibility**:

1. **Smart sections** - Rearrange your resume by moving text around. Want skills before experience? Just reorder it.
2. **Text formatting** - Make words **bold** or *italic* right in your content using simple `**bold**` syntax
3. **Custom labels** - Call it "Position" instead of "Title", "Achievements" instead of "Responsibilities"
4. **Multiple section types** - Have two skills sections, split work experience by time period, etc.
5. **Always perfect** - Edit once, generate PDF anytime, always looks professional

---

## Quick Links

> **🚀 Just want to get started?** See [QUICKSTART.md](QUICKSTART.md) for a condensed guide.
>
> **📖 Want to understand the flexible system?** See [FLEXIBLE-SYSTEM.md](FLEXIBLE-SYSTEM.md) for detailed documentation.

## Requirements

- **Web Browser** (Chrome or Edge recommended for best print support)
- **Local Server** (choose one):
  - VSCode with Live Preview extension (recommended for VSCode users)
  - Python 3.x (for `python -m http.server`)
- **Optional**: Python with WeasyPrint for automated PDF generation

## Project Structure

```
resume-project/
├── resume.yml                    # Your resume data (edit this!)
├── resume-example-flexible.yml   # Example showing flexible structure
├── index.html                    # Main HTML page
├── style.css                     # Styling (screen + print)
├── resume.js                     # YAML loading and rendering
├── generate-pdf-weasyprint.py    # Backup PDF generator
├── requirements.txt              # Python dependencies
├── start-server.sh               # Helper script (optional, for Python server)
├── QUICKSTART.md                 # Quick reference guide
├── FLEXIBLE-SYSTEM.md            # Detailed guide to section system
├── MIGRATION-GUIDE.md            # Guide for updating to new structure
└── README.md                     # This file (full documentation)
```

## Quick Start

### 0. VSCode Setup (Recommended)

If you're using VSCode, install the **Live Preview** extension for the best experience:

1. Open VSCode
2. Press `Ctrl+Shift+X` to open Extensions
3. Search for "Live Preview" (by Microsoft)
4. Click Install
5. You're ready to go!

**Why Live Preview?**
- ✅ No command line needed
- ✅ Auto-refresh on file save
- ✅ Integrated in your editor
- ✅ Preview in VSCode or external browser
- ✅ No port management

### 1. Edit Your Resume

Edit `resume.yml` with your information. The file is already populated with your data.

### 2. View in Browser

You have two options to run a local server:

#### Option A: VSCode Live Preview (Recommended for VSCode Users)

1. **Install Extension** (one-time setup):
   - Open Extensions panel (`Ctrl+Shift+X`)
   - Search for "Live Preview" by Microsoft
   - Click Install

2. **Run Live Preview**:
   - Right-click `index.html` in the file explorer
   - Select **"Show Preview"**
   - Or press `Ctrl+Shift+V` (Windows/Linux) or `Cmd+Shift+V` (Mac)
   - Your preview will open in VSCode or external browser

3. **Benefits**:
   - Auto-refresh on save
   - Integrated in VSCode
   - No terminal needed
   - Multiple preview options (embedded or external browser)

#### Option B: Python HTTP Server

```bash
# Start local HTTP server
python -m http.server 8000

# Or use the helper script (Linux/Mac)
./start-server.sh

# Open in browser
http://localhost:8000
```

**Use this if:**
- You're not using VSCode
- You prefer external browser control
- You want to test on multiple devices (use your IP address)

**Comparison:**

| Feature | VSCode Live Preview | Python Server |
|---------|-------------------|---------------|
| Setup | Install extension | Python required |
| Start Method | Right-click or `Ctrl+Shift+V` | Terminal command |
| Auto-refresh | ✅ Yes | ❌ Manual |
| Multi-device | ❌ Local only | ✅ Yes (via IP) |
| Integration | ✅ VSCode native | ❌ Separate |
| Terminal needed | ❌ No | ✅ Yes |

### 3. Generate PDF

#### Option A: Browser Print-to-PDF (Recommended)

1. Open http://localhost:8000 in your browser
2. Press `Ctrl+P` (Windows/Linux) or `Cmd+P` (Mac)
3. Select "Save as PDF" as destination
4. **Important settings:**
   - Set margins to "Default" or "None"
   - Enable "Background graphics"
   - Set scale to 100%
5. Click "Save"

**Tips for best results:**
- Use Chrome or Edge for best print CSS support
- Check print preview before saving
- Adjust CSS in `style.css` if needed (see `@media print` section)

#### Option B: WeasyPrint (Automated Backup)

If browser print doesn't work well:

```bash
# Install dependencies (first time only)
pip install -r requirements.txt

# Generate PDF
python generate-pdf-weasyprint.py
```

This will create `resume.pdf` in the current directory.

**Note:** WeasyPrint requires system-level dependencies. See installation instructions below.

## Installation Details

### Browser-Based (No Installation Required)

The HTML version uses CDN for the YAML parser, so you don't need to install anything except Python for the HTTP server.

### WeasyPrint Installation

If using the Python PDF generator:

**Ubuntu/Debian:**
```bash
sudo apt-get install python3-dev python3-pip python3-setuptools \
  python3-wheel python3-cffi libcairo2 libpango-1.0-0 \
  libpangocairo-1.0-0 libgdk-pixbuf2.0-0 libffi-dev shared-mime-info

pip install -r requirements.txt
```

**macOS:**
```bash
brew install cairo pango gdk-pixbuf libffi
pip install -r requirements.txt
```

**Windows:**
See [WeasyPrint Windows installation guide](https://doc.courtbouillon.org/weasyprint/stable/first_steps.html#windows)

## Customization

### Creating Multiple Sections of Same Type

You can have multiple skills, work, or research sections:

```yaml
# Example: Focused resume with multiple skill sections
technical_skills:
  _type: skills
  _title: Technical Skills
  languages:
    - Python
    - Go

soft_skills:
  _type: skills
  _title: Soft Skills
  leadership:
    - Team Management
    - Mentoring

recent_experience:
  _type: work
  _title: Recent Experience (Last 3 Years)
  items:
    - title: Senior Engineer
      company: Current Company
      # ...

early_experience:
  _type: work
  _title: Early Career
  items:
    - title: Junior Developer
      company: First Company
      # ...
```

### Reordering Sections

Simply rearrange sections in your YAML file. The order in YAML determines the display order:

```yaml
# Version 1: Skills-first resume
personal_info: {...}
summary: {...}
skills: {...}              # Skills before work
work_experience: {...}
education: {...}

# Version 2: Experience-first resume
personal_info: {...}
summary: {...}
work_experience: {...}     # Work before skills
skills: {...}
education: {...}
```

### Modify Styling

Edit `style.css` to change colors, fonts, layout, etc.

Key sections:
- **Base styles:** General appearance
- **Section styles:** Individual section formatting
- **Print styles:** `@media print` section for PDF output

### Modify Layout

Edit `resume.js` to change:
- Section order
- What information is displayed
- HTML structure

### YAML Structure

**Key Concept:** Each section has `_type`, `_title`, and optional `_labels` fields that control rendering. All content and labels are defined in YAML.

```yaml
section_name:
  _type: section_type      # Determines how section is rendered
  _title: Display Title    # What appears as section heading
  _labels:                 # Optional: customize field labels
    field_name: Custom Label
  # ... section data follows
```

### Text Formatting

**Markdown-style formatting** is supported in long text fields (descriptions, responsibilities, summaries):

| Syntax | Output | Example |
|--------|--------|---------|
| `**text**` | **bold** | `**Seeking**` → **Seeking** |
| `*text*` | *italic* | `*Data science*` → *Data science* |
| `__text__` | underline | `__important__` → <u>important</u> |

**Where formatting works:**
- ✅ Summary content
- ✅ Work experience responsibilities
- ✅ Research descriptions and technical environment
- ✅ Publication notes

**Where formatting does NOT work (by design):**
- ❌ Names, titles, job titles
- ❌ Company names, institutions
- ❌ Dates, locations
- ❌ Skills lists (could break items like "C++")
- ❌ URLs, emails

**Example:**
```yaml
summary:
  _type: summary
  _title: Summary
  content: |
    ML researcher and engineer. **Seeking** a role in *ML*, *Data science*,
    or *GenAI*, with demonstrated ability to integrate __ML innovations__
    into complex environments.

work_experience:
  _type: work
  _title: Work Experience
  items:
    - title: Software Engineer
      company: Tech Corp
      responsibilities:
        - Led development of **machine learning pipeline** with *PyTorch*
        - Improved performance by __40%__ through optimization

# Example - Contact:
personal_info:
  _type: contact
  name: Your Name
  email: your@email.com
  # ...

# Example - Summary:
summary:
  _type: summary
  _title: Summary
  content: |
    Your summary text

# Example - Education with custom labels:
education:
  _type: education
  _title: Education
  _labels:                  # Optional
    degree: Qualification
    institution: University
    graduation_date: Completed
  items:
    - degree: PhD
      institution: University
      graduation_date: "12/2024"

# Example - Skills (NEW STRUCTURE):
core_skills:
  _type: skills
  _title: Core Skills
  
  programming_languages:      # Category key
    _title: Programming Languages  # Required: category display name
    _items:                        # Required: skill items as array
      - Python
      - C++
      - JavaScript
  
  frameworks:
    _title: Frameworks & Libraries
    _items:
      - React
      - Django
      - TensorFlow

# Example - Work with custom labels:
work_experience:
  _type: work
  _title: Work Experience
  _labels:                  # Optional
    title: Position
    company: Organization
    duration: Period
    responsibilities: Key Achievements
  items:
    - title: Job Title
      company: Company Name
      duration: Jan 2023 - Present
      responsibilities:
        - Bullet point 1
        - Bullet point 2
```

**Available Section Types:**
- `contact` - Personal information (name, email, links)
- `summary` - Professional summary (uses `content` field)
- `education` - Education entries (uses `items` array, optional `_labels`)
- `skills` - Skills grouped by category (each category has `_title` and `_items`)
- `work` - Work experience (uses `items` array, optional `_labels`)
- `research` - Research projects (uses `items` array, optional `_labels`)
- `certificates` - Certifications (uses `items` array, optional `_labels`)
- `publications` - Publications and scholar link (optional `_labels`)

**Key Features:**
- ✅ **Content control in YAML:** All text, labels, and structure defined in YAML
- ✅ **Skills structure:** Each category has `_title` (display name) and `_items` (array of skills)
- ✅ **Custom labels:** Use `_labels` to rename fields (e.g., "Position" instead of "Title")
- ✅ **Reorder sections:** YAML order = display order
- ✅ **Multiple sections of same type:** Have multiple `skills`, `work`, etc. sections
- ✅ **Skip sections:** Just remove them from YAML

## Troubleshooting

### "Failed to load resume.yml" Error

**Problem:** Browser can't load YAML file

**Solutions:**

**Option 1 - VSCode Live Preview:**
1. Install "Live Preview" extension by Microsoft
2. Right-click `index.html` → "Show Preview"
3. Or press `Ctrl+Shift+V`

**Option 2 - Python Server:**
```bash
python -m http.server 8000
```

**Important:** Don't open `index.html` directly with `file://` protocol - this causes CORS errors and prevents YAML loading.

### Print CSS Not Working

**Problem:** PDF doesn't look right

**Solutions:**
1. Use Chrome or Edge (better print CSS support)
2. Check print preview settings:
   - Enable background graphics
   - Set proper margins
   - Set scale to 100%
3. Modify `@media print` section in `style.css`

### WeasyPrint Errors

**Problem:** PDF generation fails

**Solutions:**
1. Ensure system dependencies are installed (see above)
2. Check Python version (3.7+ required)
3. Try updating: `pip install --upgrade weasyprint`

### Page Breaks in Wrong Places

**Problem:** Content splits across pages awkwardly

**Solution:** Add/modify CSS rules:
```css
@media print {
  .experience-item {
    page-break-inside: avoid;  /* Keep items together */
  }
  
  .section {
    page-break-after: avoid;  /* Don't break after headers */
  }
}
```

## Tips

### For Best PDF Output

1. **Keep it concise:** 1-2 pages ideal
2. **Test print preview:** Before finalizing
3. **Use web-safe fonts:** Better compatibility
4. **Avoid complex layouts:** Simpler = more reliable PDF

### Workflow

**Using VSCode:**
1. Edit `resume.yml`
2. Save (`Ctrl+S`)
3. Live Preview auto-refreshes
4. Adjust CSS if needed in `style.css`
5. Generate PDF when satisfied

**Using Python Server:**
1. Edit `resume.yml`
2. Save file
3. Refresh browser manually
4. Adjust CSS if needed
5. Generate PDF when satisfied

### Version Control

Add to `.gitignore`:
```
*.pdf
__pycache__/
*.pyc
```

Keep in git:
- `resume.yml`
- `index.html`
- `style.css`
- `resume.js`
- `generate-pdf-weasyprint.py`
- `requirements.txt`

## Advanced Usage

### VSCode Tips

**Keyboard Shortcuts:**
- `Ctrl+Shift+V` - Open Live Preview
- `Ctrl+K V` - Open preview to the side
- `Ctrl+Shift+P` → "Live Preview: Show Preview" - Command palette

**Settings (Optional):**

Add to your `.vscode/settings.json`:
```json
{
  "livePreview.defaultPreviewPath": "/index.html",
  "livePreview.autoRefreshPreview": "On Changes to Saved Files"
}
```

**Multi-file Editing:**
1. Split editor: `Ctrl+\`
2. `resume.yml` on left
3. Live Preview on right
4. Edit and see changes instantly

### Multiple Resume Versions

Create different resume versions by adjusting section order and titles:

**Example: Academic vs. Industry Resume**

```yaml
# resume-academic.yml
personal_info: { _type: contact, ... }
education: { _type: education, _title: "Education", ... }
research: { _type: research, _title: "Research Experience", ... }
publications: { _type: publications, _title: "Publications", ... }
industry_work: { _type: work, _title: "Industry Experience", ... }

# resume-industry.yml  
personal_info: { _type: contact, ... }
work_experience: { _type: work, _title: "Professional Experience", ... }
technical_skills: { _type: skills, _title: "Technical Skills", ... }
education: { _type: education, _title: "Education", ... }
certifications: { _type: certificates, _title: "Certifications", ... }
```

Simply rename the file you want to use to `resume.yml`.

For more examples, see [FLEXIBLE-SYSTEM.md](FLEXIBLE-SYSTEM.md).

### Custom Themes

Create multiple CSS files:
- `style-classic.css`
- `style-modern.css`
- `style-minimal.css`

Switch themes by changing the `<link>` tag in `index.html`.

## License

This is your personal resume generator. Use it however you like!

## Credits

- **YAML Parser:** [js-yaml](https://github.com/nodeca/js-yaml) (MIT License)
- **PDF Generator:** [WeasyPrint](https://weasyprint.org/) (BSD License)
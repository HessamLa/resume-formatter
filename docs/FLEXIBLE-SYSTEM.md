# Flexible Section System Guide

This resume generator uses a **type-based rendering system with full content control in YAML**. JavaScript handles only styling and formatting—all text, labels, and structure are defined in your YAML file.

## Core Principles

1. **Content in YAML**: All text, labels, and structure
2. **Styling in JavaScript**: HTML generation and CSS classes only
3. **Type-based rendering**: `_type` determines format
4. **Customizable labels**: `_labels` overrides default field names

## Section Structure

### Basic Template
```yaml
section_name:
  _type: section_type      # Required: Tells renderer what format to use
  _title: Display Title    # Required: Section heading
  _labels:                 # Optional: Customize field labels
    field_name: Custom Label
  # ... your data follows
```

## Available Section Types

### 1. `contact` - Personal Information

**Structure:** Direct properties (no `_labels` needed)

```yaml
personal_info:
  _type: contact
  name: Your Name
  full_name: Your Full Name, Ph.D.
  location: City, State
  email: you@example.com
  linkedin: linkedin.com/in/yourprofile/
  github: github.com/yourprofile/
  scholar: https://scholar.google.com/...  # Optional
```

**Notes:**
- Contact section doesn't use `_title` (always rendered as header)
- All fields are displayed in header format
- Links are automatically formatted

---

### 2. `summary` - Professional Summary

**Structure:** Uses `content` field

```yaml
summary:
  _type: summary
  _title: Professional Summary
  content: |
    Your multi-line summary text goes here.
    Use the | character for multi-line content.
    Each line can be a separate paragraph.
```

**Customization:**
- Change `_title` to "Executive Summary", "Profile", "About Me", etc.
- Use `|` for multi-line text preservation

---

### 3. `education` - Educational Background

**Structure:** Uses `items` array with optional `_labels`

```yaml
education:
  _type: education
  _title: Education
  _labels:                 # Optional: customize field labels
    degree: Degree
    institution: University
    campus: Campus
    graduation_date: Completed
  items:
    - degree: PhD in Computer Science
      institution: University Name
      campus: Main Campus        # Optional
      graduation_date: "12/2024"
    
    - degree: Master of Science
      institution: Another University
      graduation_date: "05/2020"
```

**Available fields per item:**
- `degree` - Degree name (required)
- `institution` - School/university name (required)
- `campus` - Campus name (optional)
- `graduation_date` - Completion date (required)

**Customization examples:**
```yaml
_labels:
  degree: Qualification
  institution: Educational Institution
  campus: Location
  graduation_date: Year Completed
```

---

### 4. `skills` - Technical/Professional Skills

**NEW STRUCTURE:** Each category has `_title` and `_items`

```yaml
skills:
  _type: skills
  _title: Skills
  
  category_key:                    # Your category identifier
    _title: Category Display Name  # What shows in resume
    _items:                        # List of skills
      - Skill 1
      - Skill 2
      - Skill 3
  
  another_category:
    _title: Another Category
    _items:
      - Item A
      - Item B

# Example:
technical_skills:
  _type: skills
  _title: Technical Skills
  
  programming_languages:
    _title: Programming Languages
    _items:
      - Python
      - JavaScript
      - Go
      - Rust
  
  frameworks:
    _title: Frameworks & Libraries
    _items:
      - React
      - Django
      - TensorFlow
  
  tools:
    _title: Development Tools
    _items:
      - Git
      - Docker
      - Kubernetes
```

**Key points:**
- Each category MUST have `_title` and `_items`
- `_items` must be an array
- Category keys (e.g., `programming_languages`) are internal identifiers
- Display names come from `_title` fields

**Multiple skills sections:**
```yaml
core_skills:
  _type: skills
  _title: Core Technical Skills
  languages:
    _title: Languages
    _items: [...]

soft_skills:
  _type: skills
  _title: Soft Skills
  communication:
    _title: Communication
    _items: [...]
  leadership:
    _title: Leadership
    _items: [...]
```

---

### 5. `work` - Work Experience

**Structure:** Uses `items` array with optional `_labels`

```yaml
work_experience:
  _type: work
  _title: Work Experience
  _labels:                 # Optional: customize field labels
    title: Position
    company: Organization
    duration: Period
    responsibilities: Key Achievements
  items:
    - title: Senior Engineer
      company: Company Name
      duration: Jan 2023 - Present
      responsibilities:
        - Led team of 5 engineers
        - Improved system performance by 40%
        - Deployed ML models to production
    
    - title: Software Engineer
      company: Previous Company
      duration: Jun 2020 - Dec 2022
      responsibilities:
        - Built microservices architecture
        - Reduced latency by 50%
```

**Available fields per item:**
- `title` - Job title (required)
- `company` - Company name (required)
- `duration` - Time period (required)
- `responsibilities` - Array of bullet points (optional)

**Customization examples:**
```yaml
# Academic style
_labels:
  title: Position
  company: Institution
  duration: Tenure
  responsibilities: Responsibilities

# Consulting style
_labels:
  title: Role
  company: Client
  duration: Engagement Period
  responsibilities: Deliverables
```

**Multiple work sections:**
```yaml
recent_experience:
  _type: work
  _title: Recent Experience (2020-Present)
  _labels:
    responsibilities: Key Achievements
  items: [...]

early_career:
  _type: work
  _title: Early Career (2015-2020)
  _labels:
    responsibilities: Contributions
  items: [...]
```

---

### 6. `research` - Research Experience/Projects

**Structure:** Uses `items` array with optional `_labels`

```yaml
research_experience:
  _type: research
  _title: Research Experience
  _labels:                         # Optional: customize field labels
    title: Project Title
    references: References
    institution: Affiliation
    type: Project Type
    description: Overview
    technical_environment: Technical Setup
    applied_methods: Technologies Used
  items:
    - title: Project Name
      references: "[1,2]"                    # Optional
      institution: University/Company
      type: PhD Thesis                       # Optional
      description: |
        Detailed description of the research.
        Can be multiple paragraphs.
      technical_environment: |               # Optional
        Technical details about the setup.
      applied_methods:                       # Optional - array
        - Machine Learning
        - Statistical Analysis
        - Data Visualization
```

**Available fields per item:**
- `title` - Project/research title (required)
- `references` - Citation references (optional)
- `institution` - Where research was conducted (required)
- `type` - Type of project (e.g., "PhD Thesis", "Research Project") (optional)
- `description` - Detailed description (optional)
- `technical_environment` - Technical setup details (optional)
- `applied_methods` - Array of methods/technologies used (optional)

**Customization examples:**
```yaml
# Industry research style
_labels:
  title: Research Project
  institution: Company
  type: Project Category
  description: Summary
  technical_environment: Infrastructure
  applied_methods: Technologies & Methods

# Academic style
_labels:
  title: Research Topic
  institution: Laboratory
  type: Research Type
  description: Abstract
  technical_environment: Experimental Setup
  applied_methods: Methodologies
```

---

### 7. `certificates` - Certifications

**Structure:** Uses `items` array with optional `_labels`

```yaml
certificates:
  _type: certificates
  _title: Professional Certifications
  _labels:                 # Optional: customize field labels
    name: Certification
    institution: Issuing Organization
    verification_url: Verification Link
  items:
    - name: AWS Certified Solutions Architect
      institution: Amazon Web Services
      verification_url: https://verify.aws.com/...  # Optional
    
    - name: Machine Learning Specialization
      institution: Stanford University / Coursera
      verification_url: https://coursera.org/verify/...
```

**Available fields per item:**
- `name` - Certificate name (required)
- `institution` - Issuing organization (required)
- `verification_url` - Verification link (optional)

**Customization examples:**
```yaml
_labels:
  name: Course Title
  institution: Provider
  verification_url: Verify At
```

---

### 8. `publications` - Publications & Research Output

**Structure:** Direct properties with optional `_labels`

```yaml
publications:
  _type: publications
  _title: Publications
  _labels:                 # Optional: customize field labels
    note: Publication Note
    scholar_url: Google Scholar Profile
  note: "Under the name 'Alternative Name'"  # Optional
  scholar_url: https://scholar.google.com/citations?user=...
```

**Available fields:**
- `note` - Additional note about publications (optional)
- `scholar_url` - Link to Google Scholar profile (optional)

**Customization examples:**
```yaml
_labels:
  note: Note
  scholar_url: Full Publication List

# Or more formal:
_labels:
  note: Publication Details
  scholar_url: Complete Bibliography
```

---

## Complete Examples

### Example 1: Technical Resume with Multiple Skills Sections

```yaml
personal_info:
  _type: contact
  name: Jane Smith
  # ...

summary:
  _type: summary
  _title: Summary
  content: ML engineer with 5+ years experience...

# Separate technical and soft skills
technical_skills:
  _type: skills
  _title: Technical Skills
  
  languages:
    _title: Programming Languages
    _items: [Python, Go, JavaScript]
  
  ml_frameworks:
    _title: ML/AI Frameworks
    _items: [TensorFlow, PyTorch, Scikit-learn]

soft_skills:
  _type: skills
  _title: Professional Skills
  
  leadership:
    _title: Leadership
    _items: [Team Management, Mentoring, Project Planning]
  
  communication:
    _title: Communication
    _items: [Technical Writing, Public Speaking, Cross-functional Collaboration]

work_experience:
  _type: work
  _title: Experience
  items: [...]
```

### Example 2: Academic Resume with Custom Labels

```yaml
personal_info:
  _type: contact
  # ...

education:
  _type: education
  _title: Academic Background
  _labels:
    degree: Qualification
    institution: University
    graduation_date: Year
  items: [...]

research:
  _type: research
  _title: Research Projects
  _labels:
    title: Research Topic
    institution: Laboratory
    type: Project Type
    description: Abstract
    applied_methods: Methodologies
  items: [...]

teaching:
  _type: work
  _title: Teaching Experience
  _labels:
    title: Course
    company: Institution
    duration: Semester
    responsibilities: Topics Covered
  items: [...]
```

### Example 3: Consulting Resume with Multiple Work Sections

```yaml
personal_info:
  _type: contact
  # ...

current_clients:
  _type: work
  _title: Current Engagements
  _labels:
    title: Role
    company: Client
    duration: Engagement Period
    responsibilities: Deliverables
  items: [...]

past_projects:
  _type: work
  _title: Previous Projects
  _labels:
    title: Project
    company: Client Organization
    duration: Timeline
    responsibilities: Outcomes
  items: [...]

core_competencies:
  _type: skills
  _title: Core Competencies
  
  strategy:
    _title: Strategic Consulting
    _items: [Business Strategy, Digital Transformation, ...]
  
  technical:
    _title: Technical Expertise
    _items: [Cloud Architecture, Data Analytics, ...]
```

---

## Best Practices

### ✅ DO:

1. **Always include required fields:**
   - `_type` for every section
   - `_title` for every section (except `contact`)
   - `_title` and `_items` for each skills category

2. **Use descriptive category keys:**
   ```yaml
   # Good
   programming_languages:
     _title: Programming Languages
   
   # Avoid
   set1:
     _title: Programming Languages
   ```

3. **Customize labels for clarity:**
   ```yaml
   _labels:
     responsibilities: Key Achievements  # More impactful
   ```

4. **Use multi-line for long text:**
   ```yaml
   description: |
     First paragraph.
     
     Second paragraph.
   ```

### ❌ DON'T:

1. **Forget `_items` in skills:**
   ```yaml
   # Wrong
   languages:
     _title: Languages
     - Python  # Missing _items
   
   # Correct
   languages:
     _title: Languages
     _items:
       - Python
   ```

2. **Mix structures:**
   ```yaml
   # Wrong - mixing old and new structure
   skills:
     _type: skills
     languages: [Python, Go]  # Old structure
   
   # Correct
   skills:
     _type: skills
     languages:
       _title: Languages
       _items: [Python, Go]
   ```

3. **Hardcode labels in YAML data:**
   ```yaml
   # Wrong - label in content
   items:
     - title: "Position: Senior Engineer"
   
   # Correct - use _labels
   _labels:
     title: Position
   items:
     - title: Senior Engineer
   ```

---

## Troubleshooting

### Skills Not Showing

**Problem:** Skills section appears but categories don't show

**Check:**
1. Each category has `_title`
2. Each category has `_items` (not just array directly)
3. `_items` is an array with at least one element

```yaml
# Wrong
languages:
  - Python
  - Go

# Correct
languages:
  _title: Languages
  _items:
    - Python
    - Go
```

### Custom Labels Not Applied

**Problem:** Field labels show defaults instead of custom labels

**Check:**
1. `_labels` is at section level (not item level)
2. Label keys match actual field names in items

```yaml
# Wrong - labels in item
items:
  - _labels:
      title: Position
    title: Engineer

# Correct - labels at section level
_labels:
  title: Position
items:
  - title: Engineer
```

### Section Not Rendering

**Problem:** Section doesn't appear in output

**Check:**
1. `_type` field is present and spelled correctly
2. `_title` field is present (except for `contact`)
3. Data structure matches the type requirements
4. Check browser console for warnings

---

## Summary

**Key Changes from Basic System:**

1. **Skills sections:** Each category now has `_title` and `_items`
2. **All sections:** Can customize field labels with `_labels`
3. **Content control:** All text and labels defined in YAML
4. **JavaScript role:** Only handles HTML generation and CSS classes

This gives you complete control over your resume content without touching any code!
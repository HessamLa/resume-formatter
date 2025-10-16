// Load and render resume from YAML file
async function loadResume() {
    try {
        // Fetch the YAML file
        const response = await fetch('resume.yml');
        if (!response.ok) {
            throw new Error(`Failed to load resume.yml: ${response.statusText}`);
        }
        
        let yamlText = await response.text();

        // Fix YAML parsing issue: quote lines that start with ** (markdown bold)
        // to prevent them from being interpreted as YAML aliases
        yamlText = yamlText.replace(/^(\s+- )(\*\*.+)$/gm, '$1"$2"');

        // Parse YAML using js-yaml library (loaded from CDN)
        const data = jsyaml.load(yamlText);
        
        // Render the resume
        renderResume(data);
        
        // Hide loading, show resume
        document.querySelector('.loading').style.display = 'none';
        document.getElementById('resume-container').style.display = 'block';
        
        // Show save buttons
        document.getElementById('save-buttons').style.display = 'flex';

        // Show control sliders
        document.getElementById('font-size-control').style.display = 'flex';
        document.getElementById('margin-control').style.display = 'flex';

        // Attach save button handlers
        setupSaveButtons();

        // Setup control sliders
        setupControlSliders();
        
    } catch (error) {
        document.querySelector('.loading').innerHTML = `
            <div style="color: #e74c3c;">
                <h2>Error Loading Resume</h2>
                <p>${error.message}</p>
                <p>Make sure you're running a local server:</p>
                <p><strong>VSCode:</strong> Right-click index.html → "Show Preview"</p>
                <p><strong>Command line:</strong> <code>python -m http.server 8000</code></p>
                <p>Then open: <a href="http://localhost:8000">http://localhost:8000</a></p>
            </div>
        `;
        console.error('Error loading resume:', error);
    }
}

// Main render function - processes sections dynamically based on _type
function renderResume(data) {
    const container = document.getElementById('resume-container');
    let html = '';
    
    // Type-to-renderer mapping
    const renderers = {
        'contact': renderContact,
        'summary': renderSummary,
        'education': renderEducation,
        'skills': renderSkills,
        'work': renderWork,
        'research': renderResearch,
        'certificates': renderCertificates,
        'publications': renderPublications
    };
    
    // Iterate through sections in YAML order
    for (const [sectionKey, sectionData] of Object.entries(data)) {
        if (!sectionData || typeof sectionData !== 'object') {
            continue;
        }
        
        // Extract metadata
        const type = sectionData._type;
        const title = sectionData._title;
        const labels = sectionData._labels || {};
        
        // Skip if no type specified
        if (!type) {
            console.warn(`Section "${sectionKey}" has no _type field, skipping`);
            continue;
        }
        
        // Get the appropriate renderer
        const renderer = renderers[type];
        if (!renderer) {
            console.warn(`Unknown type "${type}" for section "${sectionKey}"`);
            continue;
        }
        
        // Extract data (excluding metadata fields)
        const content = extractContent(sectionData);
        
        // Render section
        html += renderer(content, title, labels, sectionKey);
    }
    
    container.innerHTML = html;
}

// Extract content from section (remove metadata fields)
function extractContent(sectionData) {
    const content = {};
    for (const [key, value] of Object.entries(sectionData)) {
        if (!key.startsWith('_')) {
            content[key] = value;
        }
    }
    return content;
}

// ==================== RENDERERS ====================

// Render contact/header section
function renderContact(data, title, labels) {
    const contactItems = [
        data.location,
        `<a href="mailto:${data.email}">${data.email}</a>`,
        `<a href="https://${data.linkedin}" target="_blank">${data.linkedin}</a>`,
        `<a href="https://${data.github}" target="_blank">${data.github}</a>`
    ].filter(Boolean);

    return `
        <div class="header">
            <h1>${escapeHtml(data.name)}</h1>
            ${data.full_name ? `<div class="subtitle">${escapeHtml(data.full_name)}</div>` : ''}
            <div class="contact-info">
                ${contactItems.join(' | ')}
            </div>
        </div>
    `;
}

// Render summary section (inline format)
function renderSummary(data, title, labels) {
    return `
        <p class="summary-inline">
            <strong>${escapeHtml(title)}:</strong> ${parseFormatting(data.content)}
        </p>
    `;
}

// Render education section
function renderEducation(data, title, labels) {
    const items = data.items.map(edu => {
        const parts = [];
        
        // Build institution line
        let institutionLine = escapeHtml(edu.institution);
        if (edu.campus) {
            institutionLine += ` - ${escapeHtml(edu.campus)}`;
        }
        
        return `
            <div class="education-item">
                <span class="date">${escapeHtml(edu.graduation_date)}</span>
                <div class="degree">${escapeHtml(edu.degree)}</div>
                <div class="institution">${institutionLine}</div>
            </div>
        `;
    }).join('');
    
    return `
        <div class="section">
            <h2 class="section-title">${escapeHtml(title)}</h2>
            ${items}
        </div>
    `;
}

// Render skills section with new structure
function renderSkills(data, title, labels) {
    let html = `<div class="section"><h2 class="section-title">${escapeHtml(title)}</h2>`;
    
    // Iterate through all categories in the skills section
    for (const [categoryKey, categoryData] of Object.entries(data)) {
        // Skip if not a category object with _title and _items
        if (!categoryData || typeof categoryData !== 'object') {
            continue;
        }
        
        const categoryTitle = categoryData._title;
        const categoryItems = categoryData._items;
        
        if (!categoryTitle || !Array.isArray(categoryItems) || categoryItems.length === 0) {
            continue;
        }
        
        html += `
            <div class="skills-category">
                <strong>${escapeHtml(categoryTitle)}:</strong>
                <span class="skills-list">${categoryItems.map(parseFormatting).join(', ')}</span>
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

// Render work experience section
function renderWork(data, title, labels) {
    // Default labels
    const defaultLabels = {
        title: 'Title',
        company: 'Company',
        duration: 'Duration',
        responsibilities: 'Responsibilities'
    };
    
    // Merge with custom labels
    const finalLabels = { ...defaultLabels, ...labels };
    
    const items = data.items.map(exp => `
        <div class="experience-item">
            <div class="experience-header">
                <div>
                    <span class="job-title">${escapeHtml(exp.title)}</span>
                    <span class="company"> || ${escapeHtml(exp.company)}</span>
                </div>
                <div class="duration">${escapeHtml(exp.duration)}</div>
            </div>
            ${exp.responsibilities && exp.responsibilities.length > 0 ? `
                <ul class="responsibilities">
                    ${exp.responsibilities.map(r => `<li>${parseFormatting(r)}</li>`).join('')}
                </ul>
            ` : ''}
        </div>
    `).join('');
    
    return `
        <div class="section">
            <h2 class="section-title">${escapeHtml(title)}</h2>
            ${items}
        </div>
    `;
}

// Render research experience section
function renderResearch(data, title, labels) {
    // Default labels
    const defaultLabels = {
        title: 'Title',
        references: 'References',
        institution: 'Institution',
        type: 'Type',
        description: 'Description',
        technical_environment: 'Technical Environment',
        applied_methods: 'Applied Methods'
    };
    
    // Merge with custom labels
    const finalLabels = { ...defaultLabels, ...labels };
    
    const items = data.items.map(exp => {
        let html = '<div class="research-item">';
        
        // Title and references
        html += `<div class="research-title">${escapeHtml(exp.title)}`;
        if (exp.references) {
            html += ` ${escapeHtml(exp.references)}`;
        }
        html += '</div>';
        
        // Institution and type
        html += '<div class="research-type">';
        html += escapeHtml(exp.institution);
        if (exp.type) {
            html += ` | ${escapeHtml(exp.type)}`;
        }
        html += '</div>';
        
        // Description
        if (exp.description) {
            html += `<div class="research-description">${parseFormatting(exp.description)}</div>`;
        }

        // Technical environment with italic label
        if (exp.technical_environment) {
            html += `
                <div class="applied-methods">
                    <em>${escapeHtml(finalLabels.technical_environment)}:</em>
                    ${parseFormatting(exp.technical_environment)}
                </div>
            `;
        }
        
        // Applied methods with italic label
        if (exp.applied_methods && exp.applied_methods.length > 0) {
            html += `
                <div class="applied-methods">
                    <em>${escapeHtml(finalLabels.applied_methods)}:</em>
                    <span class="methods-list"> ${exp.applied_methods.map(escapeHtml).join(' | ')}</span>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }).join('');
    
    return `
        <div class="section">
            <h2 class="section-title">${escapeHtml(title)}</h2>
            ${items}
        </div>
    `;
}

// Render certificates section
function renderCertificates(data, title, labels) {
    // Default labels
    const defaultLabels = {
        name: 'Certificate Name',
        institution: 'Institution',
        verification_url: 'Verification'
    };
    
    // Merge with custom labels
    const finalLabels = { ...defaultLabels, ...labels };
    
    const items = data.items.map(cert => `
        <div class="certificate-item">
            <div class="certificate-name">${escapeHtml(cert.name)}</div>
            <span class="certificate-institution">${escapeHtml(cert.institution)}</span>
            ${cert.verification_url ? ` ${escapeHtml(finalLabels.verification_url)}: 
                <a href="${cert.verification_url}" target="_blank" class="certificate-link">
                    ${cert.verification_url}
                </a>
            ` : ''}
        </div>
    `).join('');
    
    return `
        <div class="section">
            <h2 class="section-title">${escapeHtml(title)}</h2>
            ${items}
        </div>
    `;
}

// Render publications section
function renderPublications(data, title, labels) {
    // Default labels
    const defaultLabels = {
        note: 'Note',
        scholar_url: 'Google Scholar Profile'
    };
    
    // Merge with custom labels
    const finalLabels = { ...defaultLabels, ...labels };
    
    let html = `<div class="section"><h2 class="section-title">${escapeHtml(title)}</h2>`;
    
    if (data.note) {
        html += `<div class="publications-note">${parseFormatting(data.note)}</div>`;
    }
    
    if (data.scholar_url) {
        html += `
            <a href="${data.scholar_url}" target="_blank" class="publications-link">
                ${escapeHtml(finalLabels.scholar_url)}
            </a>
        `;
    }
    
    html += '</div>';
    return html;
}

// ==================== UTILITY FUNCTIONS ====================

// Utility function to escape HTML
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = text.toString();
    return div.innerHTML;
}

/**
 * Parse markdown-style formatting syntax into HTML tags
 * Supports: **bold**, *italic*, __underline__
 * Security: Text is first escaped, then formatting applied
 */
function parseFormatting(text) {
    if (!text) return '';

    // First escape HTML for security
    text = escapeHtml(text);

    // Then apply markdown-style formatting
    text = text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');  // **bold**
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');              // *italic*
    text = text.replace(/__(.+?)__/g, '<u>$1</u>');                // __underline__

    return text;
}

// ==================== SAVE FUNCTIONS ====================

// Setup save button event listeners
function setupSaveButtons() {
    document.getElementById('save-html-btn').addEventListener('click', saveAsHTML);
    document.getElementById('save-pdf-btn').addEventListener('click', saveAsPDF);
}

// Setup control sliders
function setupControlSliders() {
    // Font size schemes: 1=[10,11,16], 2=[9,10,14], 3=[11,12,18]
    const fontSchemes = {
        1: { base: '9pt', medium: '10pt', large: '14pt', label: 'Small' },
        2: { base: '10pt', medium: '11pt', large: '16pt', label: 'Medium' },
        3: { base: '11pt', medium: '12pt', large: '18pt', label: 'Large' }
    };

    // Margin options: [0.2, 0.3, 0.4, 0.5]
    const marginOptions = ['0.2in', '0.3in', '0.4in', '0.5in'];

    // Font size slider
    const fontSlider = document.getElementById('font-size-slider');
    const fontLabel = document.getElementById('font-size-label');

    fontSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        const scheme = fontSchemes[value];

        // Update CSS variables
        document.documentElement.style.setProperty('--font-base', scheme.base);
        document.documentElement.style.setProperty('--font-medium', scheme.medium);
        document.documentElement.style.setProperty('--font-large', scheme.large);

        // Update label
        fontLabel.textContent = scheme.label;
    });

    // Margin slider
    const marginSlider = document.getElementById('margin-slider');
    const marginLabel = document.getElementById('margin-label');

    marginSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        const margin = marginOptions[value];

        // Update container padding
        document.getElementById('resume-container').style.padding = margin;

        // Update label
        marginLabel.textContent = margin;
    });
}

// Save as HTML file
function saveAsHTML() {
    // Get the resume content
    const resumeContent = document.getElementById('resume-container').innerHTML;
    
    // Read the CSS content
    fetch('style.css')
        .then(response => response.text())
        .then(cssContent => {
            // Get personal info for filename
            const nameElement = document.querySelector('.header h1');
            const filename = nameElement ? 
                nameElement.textContent.replace(/\s+/g, '_') + '_Resume.html' : 
                'Resume.html';
            
            // Create complete HTML document
            const completeHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume</title>
    <style>
        ${cssContent}
        
        /* Remove save buttons and sliders from saved HTML */
        #save-buttons,
        .control-slider,
        #font-size-control,
        #margin-control {
            display: none !important;
        }
        
        /* Adjust for standalone HTML */
        body {
            padding: 20px;
        }
    </style>
</head>
<body>
    <div id="resume-container">
        ${resumeContent}
    </div>
</body>
</html>`;
            
            // Create blob and download
            const blob = new Blob([completeHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            console.log('HTML file saved successfully');
        })
        .catch(error => {
            console.error('Error saving HTML:', error);
            alert('Error saving HTML file. Please check console for details.');
        });
}

// Save as PDF (triggers browser print dialog)
function saveAsPDF() {
    // Trigger browser print dialog
    window.print();
    
    // Show instructions
    setTimeout(() => {
        console.log('Print dialog opened. Select "Save as PDF" as destination.');
    }, 100);
}

// Load resume when page loads
document.addEventListener('DOMContentLoaded', loadResume);
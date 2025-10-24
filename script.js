// Store the original YAML text globally
let originalYamlText = '';

// Load and render resume from YAML file
async function loadResume() {
    try {
        // First try 'resumes/resume.yml'
        let response = await fetch('resumes/resume.yml');
        
        if (!response.ok) {
            // If resume.yml fails, try the template as fallback
            console.log('resume.yml not found, trying resume-template.yml...');
            response = await fetch('examples/resume-template.yml');
            
            if (!response.ok) {
                throw new Error(`Failed to load both resume.yml and resume-template.yml: ${response.statusText}`);
            }
        }

        let yamlText = await response.text();

        // Store original YAML text
        originalYamlText = yamlText;

        // Fix YAML parsing issue: quote lines that start with ** (markdown bold)
        // to prevent them from being interpreted as YAML aliases
        yamlText = yamlText.replace(/^(\s+- )(\*\*.+)$/gm, '$1"$2"');

        // Parse YAML using js-yaml library (loaded from CDN)
        const data = jsyaml.load(yamlText);

        // Render the resume
        renderResume(data);

        // Hide loading, show main content
        document.querySelector('.loading').style.display = 'none';
        document.getElementById('main-content').style.display = 'flex';

        // Show control pane
        document.getElementById('control-pane').style.display = 'block';

        // Populate YAML editor
        document.getElementById('yaml-editor').value = originalYamlText;

        // Attach save button handlers
        setupSaveButtons();

        // Setup control sliders
        setupControlSliders();

        // Setup pane toggle
        setupPaneToggle();

        // Setup YAML editor
        setupYamlEditor();

        // Setup debug button
        setupDebugButton();

    } catch (error) {
        document.querySelector('.loading').innerHTML = `
            <div style="color: #e74c3c;">
                <h2>Error Loading Resume</h2>
                <p>${error.message}</p>
                <p>Make sure you're running a local server:</p>
                <p><b>VSCode:</b> Right-click index.html → "Show Preview"</p>
                <p><b>Command line:</b> <code>python -m http.server 8000</code></p>
                <p>Then open: <a href="http://localhost:8000">http://localhost:8000</a></p>
            </div>
        `;
        console.error('Error loading resume:', error);
    }
}

// Update page title based on _meta.save_filename
function updatePageTitle(data) {
    if (!data || !data._meta || !data._meta.save_filename) {
        document.title = 'Resume'; // Keep default title if no save_filename specified
        return; 
    }

    // Convert save_filename to a readable title
    // Example: "My-new-resume" -> "My New Resume"
    const filename = data._meta.save_filename;
    const title = filename
        .split(/_|\-/) // split by - or _
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    document.title = title;
}

// Display validation alerts in the UI
function displayValidationAlerts(alerts) {
    const alertContainer = document.getElementById('validation-alerts');
    
    if (!alertContainer) {
        console.error('Alert container not found in DOM');
        return;
    }
    
    // Clear existing alerts
    alertContainer.innerHTML = '';
    
    // If no alerts, hide container
    if (alerts.length === 0) {
        alertContainer.style.display = 'none';
        return;
    }
    
    // Position message box below control pane
    updateAlertPosition();
    
    // Show container and add alerts
    alertContainer.style.display = 'block';
    
    // Icon mapping for different alert types
    const iconMap = {
        'info': '-',
        'warning': '⚠️',
        'error': '❌'
    };
    
    alerts.forEach((alert) => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `validation-alert validation-alert-${alert.type}`;
        alertDiv.innerHTML = `
            <span class="alert-icon">${iconMap[alert.type] || '-'}</span>
            <span class="alert-message">${escapeHtml(alert.message)}</span>
            <button class="alert-close" onclick="this.parentElement.remove(); checkIfAlertsEmpty();">×</button>
        `;
        alertContainer.appendChild(alertDiv);
    });
}

// Update alert position below control pane
function updateAlertPosition() {
    const alertContainer = document.getElementById('validation-alerts');
    const controlPane = document.getElementById('control-pane');
    
    if (!alertContainer || !controlPane) return;
    
    const controlRect = controlPane.getBoundingClientRect();
    const controlBottom = controlRect.bottom;
    
    // Position alerts 10px below the control pane
    alertContainer.style.top = `${controlBottom + 10}px`;
}

// Helper function to hide alert container if all alerts are dismissed
function checkIfAlertsEmpty() {
    const alertContainer = document.getElementById('validation-alerts');
    if (alertContainer && alertContainer.children.length === 0) {
        alertContainer.style.display = 'none';
    }
}

// Add _meta data to hidden DOM element for access by save functions
function addMetaDataToDOM(data) {
    // _meta:
    //     sections_order: []
    //     job_summary:  "str"
    //     save_filename: "str"
    const meta = data._meta;
    if(!meta) return;
    let metadataDiv = document.getElementById('resume-metadata');
    if (!metadataDiv) {
        metadataDiv = document.createElement('div');
        metadataDiv.id = 'resume-metadata';
        metadataDiv.style.display = 'none'; // Hide the metadata div
        document.body.appendChild(metadataDiv);
    }
    metadataDiv.textContent = JSON.stringify(meta);
}

// Validate section ordering and check for mismatches
function validateAndReorderSections(data) {
    const alerts = [];
    
    // Check if _meta._section_order exists
    if (!data._meta || !data._meta['sections_order']) {
        // Add info message if no section order is defined
        alerts.push({
            type: 'info',
            message: 'No sections_order defined in _meta. Sections will render in YAML order.'
        });
        return { orderedData: data, alerts: alerts };
    }
    
    const sectionOrder = data._meta['sections_order'];
    
    // Get all section keys from data (excluding _meta and other internal fields)
    const dataSectionKeys = Object.keys(data).filter(key => !key.startsWith('_'));
    
    // Type A Validation: Check if keys in _section_order exist in data (RED ERROR)
    const missingInData = [];
    sectionOrder.forEach(orderKey => {
        if (!data.hasOwnProperty(orderKey)) {
            missingInData.push(orderKey);
            console.warn(`❌ Section "${orderKey}" specified in _meta._section_order does not exist in data`);
        }
    });
    
    if (missingInData.length > 0) {
        alerts.push({
            type: 'error',
            message: `Missing sections: ${missingInData.map(k => `"${k}"`).join(', ')}`
        });
    }
    
    // Type B Validation: Check if keys in data exist in _section_order (YELLOW WARNING)
    const missingInOrder = [];
    dataSectionKeys.forEach(dataKey => {
        if (!sectionOrder.includes(dataKey)) {
            missingInOrder.push(dataKey);
            console.warn(`⚠️ Section "${dataKey}" exists in data but not in _meta._section_order`);
        }
    });
    
    if (missingInOrder.length > 0) {
        alerts.push({
            type: 'warning',
            message: `Unordered sections: ${missingInOrder.map(k => `"${k}"`).join(', ')}`
        });
    }
    
    // Add success info if no issues
    if (missingInData.length === 0 && missingInOrder.length === 0) {
        // alerts.push({
        //     type: 'info',
        //     message: 'All sections are properly ordered and validated.'
        // });
    }
    
    // Reorder sections according to _section_order
    const orderedData = {};
    
    // Add sections in the specified order
    sectionOrder.forEach(sectionKey => {
        if (data.hasOwnProperty(sectionKey)) {
            orderedData[sectionKey] = data[sectionKey];
        }
    });
    
    // // Then, add any remaining sections not in the order (at the end)
    // dataSectionKeys.forEach(sectionKey => {
    //     if (!orderedData.hasOwnProperty(sectionKey)) {
    //         orderedData[sectionKey] = data[sectionKey];
    //     }
    // });
    
    // Preserve _meta
    if (data._meta) {
        orderedData._meta = data._meta;
    }
    
    return { orderedData, alerts };
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
    
    // Update page title
    updatePageTitle(data);

    addMetaDataToDOM(data);

    // Validate and reorder sections if _meta._section_order exists
    const { orderedData, alerts } = validateAndReorderSections(data);
    data = orderedData;
    
    // Display validation alerts
    displayValidationAlerts(alerts);
    
    // Iterate through sections in YAML order
    for (const [sectionKey, sectionData] of Object.entries(data)) {
        if (!sectionData || typeof sectionData !== 'object') {
            continue;
        }
        
        // Extract metadata
        const type = sectionData._type;
        const title = sectionData.title;
        const labels = sectionData.labels || {};
        
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
        return `
            <div class="education-item">
                <span class="date">${parseFormatting(edu.graduation_date)}</span>
                <div class="institution">${parseFormatting(edu.institution)},</div>
                <div class="degree">${parseFormatting(edu.degree)}</div>
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
        // Skip metadata fields (those starting with _)
        if (categoryKey.startsWith('_')) {
            continue;
        }

        // Skip if not a category object with title and items
        if (!categoryData || typeof categoryData !== 'object') {
            continue;
        }

        const categoryTitle = categoryData.title;
        const categoryItems = categoryData.items;
        
        if (!categoryTitle || !categoryItems) {
            continue;
        }
        
        html += `
            <div class="skills-category">
                <b>${escapeHtml(categoryTitle)}:</b>
                <span class="skills-list">${parseFormatting(normalizeItems(categoryItems))}</span>
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
        if (exp.applied_methods) {
            let methodsStr = '';
            // If it is string, then use it directly
            if (typeof exp.applied_methods === 'string') {
                methodsStr = parseFormatting(exp.applied_methods);
            } 
            else if (Array.isArray(exp.applied_methods)) {
                // If it is array, join with commas
                const normalizedMethods = normalizeItems(exp.applied_methods, ';;');
                
                // Split, escape each method individually, then join with pipe
                const methodsArray = normalizedMethods.split(';;').map(m => m.trim()).filter(m => m);
                methodsStr = methodsArray.map(escapeHtml).join(' | ');
                
            }
            // Normalize to string, handling both formats
            
            html += `
                <div class="applied-methods">
                    <em>${escapeHtml(finalLabels.applied_methods)}:</em>
                    <span class="methods-list"> ${methodsStr}</span>
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
 * Supports: **bold**, *italic*, __underline__, `monospace`, $$LaTeX math$$
 * Security: Math is processed first, then text is escaped, then formatting applied
 */
function parseFormatting(text) {
    if (!text) return '';

    // Process LaTeX math expressions BEFORE escaping HTML
    // Use placeholders to protect math content from escaping and other replacements
    const mathPlaceholders = [];
    text = text.replace(/\$\$(.+?)\$\$/g, (_, mathContent) => {
        const placeholder = `LATEX_${mathPlaceholders.length}_MATH`;
        try {
            // Check if KaTeX is available
            if (typeof katex === 'undefined') {
                mathPlaceholders.push(`<span class="math-error" title="KaTeX library not loaded">${escapeHtml(mathContent)}</span>`);
                return placeholder;
            }

            // Render LaTeX using KaTeX (inline mode)
            const rendered = katex.renderToString(mathContent, {
                throwOnError: false,
                displayMode: false,
                output: 'html'
            });
            // set font size to `var(--font-base);;`
            // also set .originalContent to `mathContent`
            mathPlaceholders.push(`<span class="math-container" data-math-content="${escapeHtml(mathContent)}">${rendered}</span>`);
        } catch (e) {
            // If KaTeX fails, store the original content with error styling
            const errorMsg = e.message || 'Unknown error';
            mathPlaceholders.push(`<span class="math-error" title="LaTeX Error: ${errorMsg}">${escapeHtml(mathContent)}</span>`);
        }
        return placeholder;
    });

    // Now escape HTML for security (after extracting math)
    text = escapeHtml(text);

    // Then apply markdown-style formatting
    text = text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');            // **bold**
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');              // *italic*
    text = text.replace(/__(.+?)__/g, '<u>$1</u>');                // __underline__
    text = text.replace(/`(.+?)`/g, '<code class="monospace">$1</code>');  // `monospace`

    // Restore math placeholders (they contain already-rendered HTML from KaTeX)
    mathPlaceholders.forEach((rendered, index) => {
        text = text.replace(`LATEX_${index}_MATH`, rendered);
    });

    return text;
}

/**
 * Normalize items to a delimited string
 * Handles both string format ("item1, item2, item3") and array format (["item1", "item2", "item3"])
 * @param {string|array} items - Items in string or array format
 * @param {string} delimiter - Delimiter to use when joining array items (default: ', ')
 * @returns {string} - Delimited string
 */
function normalizeItems(items, delimiter = ', ') {
    if (!items) return '';

    // If it's already a string, return as-is
    if (typeof items === 'string') {
        return items;
    }

    // If it's an array, join with the specified delimiter
    if (Array.isArray(items)) {
        return items.join(delimiter);
    }

    // Fallback: convert to string
    return String(items);
}

// ==================== SAVE FUNCTIONS ====================

// Setup save button event listeners
function setupSaveButtons() {
    document.getElementById('save-html-btn').addEventListener('click', saveAsHTML);
    document.getElementById('save-pdf-btn').addEventListener('click', saveAsPDF);
}

// Setup control sliders
function setupControlSliders() {
    // Read font schemes from CSS custom properties
    const rootStyles = getComputedStyle(document.documentElement);
    const fontSchemes = {};

    // Parse schemes from CSS variables (1, 2, 3)
    for (let i = 1; i <= 3; i++) {
        fontSchemes[i] = {
            tiny: rootStyles.getPropertyValue(`--scheme-${i}-tiny`).trim(), 
            small: rootStyles.getPropertyValue(`--scheme-${i}-small`).trim(), 
            base: rootStyles.getPropertyValue(`--scheme-${i}-base`).trim(),
            medium: rootStyles.getPropertyValue(`--scheme-${i}-medium`).trim(),
            large: rootStyles.getPropertyValue(`--scheme-${i}-large`).trim(),
            label: rootStyles.getPropertyValue(`--scheme-${i}-label`).trim().replace(/['"]/g, '')
        };
    }

    // Margin options: [0.2, 0.3, 0.4, 0.5]
    const marginOptions = ['0.0in', '0.1in', '0.2in', '0.3in', '0.4in', '0.5in'];
    // Initialize labels
    document.getElementById('margin-slider').min = 0;
    document.getElementById('margin-slider').max = marginOptions.length - 1;
    document.getElementById('margin-slider').value = 3; // default 0.3in
    document.getElementById('margin-label').textContent = marginOptions[3];

    // Font size slider
    const fontSlider = document.getElementById('font-size-slider');
    const fontLabel = document.getElementById('font-size-label');

    fontSlider.addEventListener('input', (e) => {
        const value = e.target.value;
        const scheme = fontSchemes[value];

        // Update CSS variables by iterating through keys
        for (const key in scheme) {
            document.documentElement.style.setProperty(`--font-${key}`, scheme[key]);
        }
        
        // document.documentElement.style.setProperty('--font-tiny', scheme.tiny);
        // document.documentElement.style.setProperty('--font-small', scheme.small);
        // document.documentElement.style.setProperty('--font-base', scheme.base);
        // document.documentElement.style.setProperty('--font-medium', scheme.medium);
        // document.documentElement.style.setProperty('--font-large', scheme.large);

        // Update label
        fontLabel.textContent = scheme.label;
    });

    // Margin slider
    const marginSlider = document.getElementById('margin-slider');
    const marginLabel = document.getElementById('margin-label');

    marginSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        const margin = marginOptions[value];

        // Update container padding for web view
        document.getElementById('resume-container').style.padding = margin;

        // Update CSS variables for print @page margins
        document.documentElement.style.setProperty('--print-margin-top', margin);
        document.documentElement.style.setProperty('--print-margin-bottom', margin);
        document.documentElement.style.setProperty('--print-margin-side', margin);

        // Update label
        marginLabel.textContent = margin;
    });
}

// Setup pane toggle functionality
function setupPaneToggle() {
    const toggleBtn = document.getElementById('toggle-pane-btn');
    const paneContent = document.getElementById('pane-content');
    const toggleIcon = toggleBtn.querySelector('.toggle-icon');

    // set toggle icon initial state
    toggleIcon.textContent = '▲';
    updateAlertPosition();
    
    toggleBtn.addEventListener('click', () => {
        paneContent.classList.toggle('collapsed');
        
        // Toggle icon between ▼ (expanded) and ▲ (collapsed)
        if (paneContent.classList.contains('collapsed')) {
            toggleIcon.textContent = '▼';
        } else {
            toggleIcon.textContent = '▲';
        }
        
        // Update alert position when pane toggles
        setTimeout(updateAlertPosition, 300); // Wait for animation to complete
    });
}

// Save as HTML file
function saveAsHTML() {
    // Get the resume content
    const resumeContent = document.getElementById('resume-container').innerHTML;

    // Get CSS content - either from embedded <style> tag or fetch from file
    let cssPromise;

    // Find the style tag in <head> that contains our resume CSS
    // (avoid picking up extension/injected styles)
    const styleTags = document.head.querySelectorAll('style');
    let resumeStyleTag = null;

    for (const tag of styleTags) {
        // Check if this style tag contains our resume CSS (look for distinctive class)
        if (tag.textContent && tag.textContent.includes('/* ==================== BASE STYLES ====================')) {
            resumeStyleTag = tag;
            break;
        }
    }

    if (resumeStyleTag && resumeStyleTag.textContent) {
        // Running from all.html (embedded CSS)
        cssPromise = Promise.resolve(resumeStyleTag.textContent);
    } else {
        // Running from index.html (external CSS)
        cssPromise = fetch('style.css').then(response => response.text());
    }

    cssPromise.then(cssContent => {
        // Get filename from page title (which is set from _meta.save_filename)
        // Convert title back to filename format: "Hessam Alizadeh Resume" -> "Hessam-Alizadeh-Resume"
        const pageTitle = document.title || 'Resume';
        const baseFilename = pageTitle.replace(/\s+/g, '-');
        const filename = baseFilename + '.html';

        // Create complete HTML document
        const completeHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume</title>
    <style>
        ${cssContent}
        
        /* Remove control pane from saved HTML */
        #control-pane,
        #save-buttons,
        .control-slider,
        .toggle-btn,
        .pane-content,
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
    const originalTitle = document.title;

    // Get metadata from DOM and overwrite the document title only if a 'save_filename' exists
    const metadataDiv = document.getElementById('resume-metadata');
    if (metadataDiv && metadataDiv.textContent) {
        try {
            const meta = JSON.parse(metadataDiv.textContent);
            if (meta && meta.save_filename) {
                // Set title to the save_filename for PDF export
                document.title = meta.save_filename;
            }
        } catch (e) {
            console.error('Error parsing metadata:', e);
        }
    }

    // Trigger browser print dialog
    window.print();

    // Restore original title after a short delay
    setTimeout(() => {
        document.title = originalTitle;
    }, 1000);

    // Show instructions
    setTimeout(() => {
        console.log('Print dialog opened. Select "Save as PDF" as destination.');
    }, 100);
}

// Debug print margins
function debugPrintMargins(showAlert = false) {
    const resumeContainer = document.getElementById('resume-container');
    const body = document.body;
    const mainContent = document.getElementById('main-content');
    const resumePanel = document.getElementById('resume-panel');

    const computedBody = getComputedStyle(body);
    const computedMain = getComputedStyle(mainContent);
    const computedPanel = getComputedStyle(resumePanel);
    const computedContainer = getComputedStyle(resumeContainer);

    const report = `
=== PRINT MARGIN DEBUG REPORT ===

BODY:
  margin: ${computedBody.margin}
  padding: ${computedBody.padding}
  background: ${computedBody.background}

MAIN CONTENT:
  margin: ${computedMain.margin}
  padding: ${computedMain.padding}

RESUME PANEL:
  margin: ${computedPanel.margin}
  padding: ${computedPanel.padding}

RESUME CONTAINER:
  padding: ${computedContainer.padding}
  margin: ${computedContainer.margin}
  width: ${resumeContainer.offsetWidth}px
  box-shadow: ${computedContainer.boxShadow}

WINDOW:
  innerWidth: ${window.innerWidth}px
  innerHeight: ${window.innerHeight}px

PAGE SIZE (letter):
  8.5in x 11in = 816px x 1056px (at 96dpi)
    `;

    console.log(report);

    // Only show alert if explicitly requested (debug mode)
    if (showAlert) {
        alert('Debug report logged to console. Press F12 to view.');
    }

    return report;
}

// Toggle debug mode
function toggleDebugMode() {
    const debugBtn = document.getElementById('debug-print-btn');
    const resumeContainer = document.getElementById('resume-container');

    document.body.classList.toggle('print-debug-mode');
    debugBtn.classList.toggle('active');

    // Update button text
    if (document.body.classList.contains('print-debug-mode')) {
        debugBtn.textContent = '✓ Debug Mode ON';
        // Add data attribute for CSS content
        const padding = getComputedStyle(resumeContainer).padding;
        resumeContainer.setAttribute('data-padding', padding);
        // Log debug info with alert
        debugPrintMargins(true);  // Show alert when explicitly enabling debug mode
    } else {
        debugBtn.textContent = '🔍 Debug Print Margins';
        resumeContainer.removeAttribute('data-padding');
    }
}

// Setup debug button
function setupDebugButton() {
    const debugBtn = document.getElementById('debug-print-btn');
    debugBtn.addEventListener('click', toggleDebugMode);
}

// Log debug info before printing
window.addEventListener('beforeprint', () => {
    console.log('=== PRINTING ===');
    debugPrintMargins();
});

window.addEventListener('afterprint', () => {
    console.log('=== PRINT DIALOG CLOSED ===');
});

// Setup YAML editor functionality
function setupYamlEditor() {
    const yamlPanel = document.getElementById('yaml-panel');
    const toggleYamlBtn = document.getElementById('toggle-yaml-btn');
    const yamlEditor = document.getElementById('yaml-editor');
    const copyYamlBtn = document.getElementById('copy-yaml-btn');
    let renderTimeout = null;

    // Toggle YAML panel
    toggleYamlBtn.addEventListener('click', () => {
        yamlPanel.classList.toggle('expanded');
    });

    // Copy YAML to clipboard
    copyYamlBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(yamlEditor.value);
            const originalText = copyYamlBtn.textContent;
            copyYamlBtn.textContent = '✓ Copied!';
            setTimeout(() => {
                copyYamlBtn.textContent = originalText;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            alert('Failed to copy to clipboard');
        }
    });

    // Re-render on YAML changes (with debounce)
    yamlEditor.addEventListener('input', () => {
        // Clear existing timeout
        if (renderTimeout) {
            clearTimeout(renderTimeout);
        }

        // Set new timeout for re-rendering (500ms delay)
        renderTimeout = setTimeout(() => {
            try {
                let yamlText = yamlEditor.value;

                // Fix YAML parsing issue: quote lines that start with ** (markdown bold)
                yamlText = yamlText.replace(/^(\s+- )(\*\*.+)$/gm, '$1"$2"');

                // Parse and render
                const data = jsyaml.load(yamlText);

                renderResume(data);

                // Clear any error styling
                yamlEditor.style.borderLeft = '';
            } catch (error) {
                console.error('YAML parsing error:', error);
                // Add visual indicator of error
                yamlEditor.style.borderLeft = '3px solid #e74c3c';
            }
        }, 500);
    });

    // Handle tab key in textarea
    yamlEditor.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = yamlEditor.selectionStart;
            const end = yamlEditor.selectionEnd;
            const value = yamlEditor.value;

            // Insert 2 spaces for tab
            yamlEditor.value = value.substring(0, start) + '  ' + value.substring(end);
            yamlEditor.selectionStart = yamlEditor.selectionEnd = start + 2;
        }
    });
}

// Load resume when page loads
document.addEventListener('DOMContentLoaded', loadResume);
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

        // Setup control sliders (pass _meta for initialization)
        setupControlSliders(data._meta);

        // Setup pane toggle
        setupPaneToggle();

        // Setup YAML editor
        setupYamlEditor();

        // Setup debug button
        setupDebugButton();

    } catch (error) {
        let errorTip='';
        if (error.message.includes('unidentified alias \"*')) {
            errorTip = "Make sure to use pair of quotes or double-quores to avoid YAML alias dereferencing.";
        }
        // errorTip = `<p>${errorTip}</p>`;
        document.querySelector('.loading').innerHTML = `
            <div style="color: #e74c3c;">
                <h2>Error Loading Resume</h2>
                <p>${error.message}</p>
                ${errorTip ? `<p>${errorTip}</p>` : ''}
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
function renderContact(data, title) {
    // fa-map-marker-alt <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free v5.15.4 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"/></svg>
    // fa-phone Unicode f095
    // 
    //
    const contactItems = [
        data.location ? `<span class="contact-item">${escapeHtml(data.location)}</span>` : null,
        data.phone ? `<span class="contact-item">${escapeHtml(data.phone)}</span>` : null,
        data.email ? `<span class="contact-item"><a href="mailto:${data.email}">${data.email}</a></span>` : null,
        data.linkedin ? `<span class="contact-item"><a href="https://${data.linkedin}" target="_blank">${data.linkedin}</a></span>` : null,
        data.github ? `<span class="contact-item"><a href="https://${data.github}" target="_blank">${data.github}</a></span>` : null
    ].filter(Boolean);

    return `
        <div class="header">
            <h1>${escapeHtml(data.name)}</h1>
            ${data.full_name ? `<div class="subtitle">${escapeHtml(data.full_name)}</div>` : ''}
            <div class="contact-info">
                ${contactItems.join('   |   ')}
            </div>
        </div>
    `;
}

// Render summary section (inline format)
function renderSummary(data, title) {
    return `
        <p class="summary-inline">
            <strong>${escapeHtml(title)}:</strong> ${parseFormatting(data.content)}
        </p>
    `;
}

// Render education section
function renderEducation(data, title) {
    const items = data.items.map(edu => {
        return `
            <div class="education-item">
                <span class="date">${parseFormatting(edu.graduation_date)}</span>
                <div class="institution">${parseFormatting(edu.institution)} - ${parseFormatting(edu.degree)}</div>
                ${edu.note ? `<div class="education-note">${parseFormatting(edu.note)}</div>` : ''}
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
function renderSkills(data, title) {
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
                <b>${escapeHtml(categoryTitle)}: </b>
                <span class="skills-list">${parseFormatting(normalizeItems(categoryItems))}</span>
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

// Render work experience section
function renderWork(data, title) {
    const items = data.items.map(exp => {
        // Support both 'bullets' (new) and 'responsibilities' (legacy) fields
        const bulletItems = exp.bullets || exp.responsibilities || [];

        return `
            <div class="experience-item">
                <div class="experience-header">
                    <div>
                        <span class="job-title">${escapeHtml(exp.title)}</span>
                        <span class="company"> | ${escapeHtml(exp.company)}</span>
                    </div>
                    <div class="duration">${escapeHtml(exp.duration)}</div>
                </div>
                ${exp.note ? `<div class="experience-note">${parseFormatting(exp.note)}</div>` : ''}
                ${bulletItems.length > 0 ? `
                    <ul class="bullets">
                        ${bulletItems.map(r => `<li>${parseFormatting(r)}</li>`).join('')}
                    </ul>
                ` : ''}
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
    let itemsHtml = '';

    // Support both new structured format (items array) and legacy format (note field)
    if (data.items && data.items.length > 0) {
        // New structured format with individual publication entries
        itemsHtml = data.items.map(pub => {
            let pubHtml = '<div class="publication-item">';

            if (pub.citation) {
                pubHtml += `<div class="publication-note">${parseFormatting(pub.citation)}</div>`;
            }

            if (pub.url) {
                pubHtml += `<a href="${pub.url}" target="_blank" class="publications-link">[Link]</a>`;
            }

            pubHtml += '</div>';
            return pubHtml;
        }).join('');
    } else {
        // Legacy format with single note field
        itemsHtml = '<div class="publication-item">';
        if (data.note) {
            itemsHtml += `<div class="publication-note">${parseFormatting(data.note)}</div>`;
        }
        itemsHtml += '</div>';
    }

    // Add Google Scholar link if provided
    let scholarLink = '';
    if (data.scholar_url) {
        scholarLink = `
            <div class="publication-item">
                <a href="${data.scholar_url}" target="_blank" class="publications-link">
                    Google Scholar Profile
                </a>
            </div>
        `;
    }

    return `
        <div class="section">
            <h2 class="section-title">${escapeHtml(title)}</h2>
            ${itemsHtml}
            ${scholarLink}
        </div>
    `;
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
    // Handle combined bold-italic first: **_text_** or _**text**_
    // text = text.replace(/\*\*_(.+?)_\*\*/g, '<b><em>$1</em></b>');  // **_bold italic_**
    // text = text.replace(/_\*\*(.+?)\*\*_/g, '<em><b>$1</b></em>');  // _**bold italic**_
    // Then handle individual styles
    text = text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');            // **bold**
    text = text.replace(/_(.+?)_/g, '<em>$1</em>');                // _italic_
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
function setupControlSliders(meta = {}) {
    // Read font schemes from CSS custom properties
    const rootStyles = getComputedStyle(document.documentElement);
    const fontSchemes = {};

    // Parse schemes from CSS variables (1, 2, 3, 4)
    for (let i = 1; i <= 4; i++) {
        fontSchemes[i] = {
            tiny: rootStyles.getPropertyValue(`--scheme-${i}-tiny`).trim(),
            small: rootStyles.getPropertyValue(`--scheme-${i}-small`).trim(),
            base: rootStyles.getPropertyValue(`--scheme-${i}-base`).trim(),
            medium: rootStyles.getPropertyValue(`--scheme-${i}-medium`).trim(),
            large: rootStyles.getPropertyValue(`--scheme-${i}-large`).trim(),
            label: rootStyles.getPropertyValue(`--scheme-${i}-label`).trim().replace(/['"]/g, ''),
        };
    }

    // Font size name to scheme index mapping
    const fontSizeMap = {
        'small': 1,
        'medium': 2,
        'large': 3,
        'larger': 4
    };

    // Font face name to CSS value mapping
    const fontFaceMap = {
        'Calibri': "'Calibri', 'Segoe UI', sans-serif",
        'Times New Roman': "'Times New Roman', Times, serif",
        'Arial': "'Arial', Helvetica, sans-serif",
        'Consolas': "'Consolas', 'Monaco', monospace"
    };

    // Margin options
    const marginOptions = ['0.0in', '0.1in', '0.2in', '0.3in', '0.4in', '0.5in'];

    // Helper to parse margin value (e.g., "0.3in" -> 3)
    function marginValueToIndex(value) {
        if (!value) return null;
        const numValue = parseFloat(value);
        const index = marginOptions.findIndex(opt => parseFloat(opt) === numValue);
        return index >= 0 ? index : null;
    }

    // ==================== FONT SIZE SLIDER ====================
    const fontSlider = document.getElementById('font-size-slider');
    const fontLabel = document.getElementById('font-size-label');

    // Initialize from _meta if available
    const initialFontSize = meta.font_size ? fontSizeMap[meta.font_size.toLowerCase()] : 2;
    fontSlider.value = initialFontSize || 2;

    // Apply initial font size
    function applyFontScheme(schemeIndex) {
        const scheme = fontSchemes[schemeIndex];
        if (!scheme) return;

        document.documentElement.style.setProperty('--font-tiny', scheme.tiny);
        document.documentElement.style.setProperty('--font-small', scheme.small);
        document.documentElement.style.setProperty('--font-base', scheme.base);
        document.documentElement.style.setProperty('--font-medium', scheme.medium);
        document.documentElement.style.setProperty('--font-large', scheme.large);
        fontLabel.textContent = scheme.label;
    }

    applyFontScheme(fontSlider.value);

    fontSlider.addEventListener('input', (e) => {
        applyFontScheme(e.target.value);
    });

    // ==================== SIDE MARGINS SLIDER ====================
    const sideMarginSlider = document.getElementById('side-margin-slider');
    const sideMarginLabel = document.getElementById('side-margin-label');

    // Initialize side margins from _meta
    let initialSideMargin = marginValueToIndex(meta.margin_sides);
    if (initialSideMargin === null) {
        initialSideMargin = 3; // default 0.3in
    }

    sideMarginSlider.min = 0;
    sideMarginSlider.max = marginOptions.length - 1;
    sideMarginSlider.value = initialSideMargin;
    sideMarginLabel.textContent = marginOptions[initialSideMargin];

    // ==================== TOP/BOTTOM MARGINS SLIDER ====================
    const topBottomMarginSlider = document.getElementById('topbottom-margin-slider');
    const topBottomMarginLabel = document.getElementById('topbottom-margin-label');

    // Initialize top/bottom margins from _meta (supports margin_topbottom, margin_top, or margin_bottom)
    let initialTopBottomMargin = marginValueToIndex(meta.margin_topbottom)
        ?? marginValueToIndex(meta.margin_top)
        ?? marginValueToIndex(meta.margin_bottom);
    if (initialTopBottomMargin === null) {
        initialTopBottomMargin = 1; // default 0.1in
    }

    topBottomMarginSlider.min = 0;
    topBottomMarginSlider.max = marginOptions.length - 1;
    topBottomMarginSlider.value = initialTopBottomMargin;
    topBottomMarginLabel.textContent = marginOptions[initialTopBottomMargin];

    // Function to apply margins
    function applyMargins() {
        const sideMargin = marginOptions[sideMarginSlider.value];
        const topBottomMargin = marginOptions[topBottomMarginSlider.value];

        // Update container padding for web view (top/bottom, left/right)
        document.getElementById('resume-container').style.padding = `${topBottomMargin} ${sideMargin}`;

        // Update CSS variables for print @page margins
        document.documentElement.style.setProperty('--print-margin-top', topBottomMargin);
        document.documentElement.style.setProperty('--print-margin-bottom', topBottomMargin);
        document.documentElement.style.setProperty('--print-margin-side', sideMargin);

        // Update labels
        sideMarginLabel.textContent = sideMargin;
        topBottomMarginLabel.textContent = topBottomMargin;
    }

    // Apply initial margins
    applyMargins();

    // Side margin slider event
    sideMarginSlider.addEventListener('input', applyMargins);

    // Top/bottom margin slider event
    topBottomMarginSlider.addEventListener('input', applyMargins);

    // ==================== FONT FACE SELECTOR ====================
    const fontFaceSelect = document.getElementById('font-face-select');

    // Initialize from _meta if available
    if (meta.font_face) {
        const targetValue = fontFaceMap[meta.font_face];
        if (targetValue) {
            // Find and select the matching option
            for (let i = 0; i < fontFaceSelect.options.length; i++) {
                if (fontFaceSelect.options[i].value === targetValue) {
                    fontFaceSelect.selectedIndex = i;
                    break;
                }
            }
        }
    }

    // Apply initial font face
    const currentFontFace = fontFaceSelect.options[fontFaceSelect.selectedIndex].value;
    document.documentElement.style.setProperty('--font-family', currentFontFace);
    document.getElementById('resume-container').style.fontFamily = currentFontFace;

    fontFaceSelect.addEventListener('change', (e) => {
        const fontFamily = e.target.value;
        document.documentElement.style.setProperty('--font-family', fontFamily);
        document.getElementById('resume-container').style.fontFamily = fontFamily;
    });
}

// Setup pane toggle functionality
function setupPaneToggle() {
    const toggleBtn = document.getElementById('toggle-pane-btn');
    const paneContent = document.getElementById('pane-content');
    const toggleIcon = toggleBtn.querySelector('.toggle-icon');

    // Initial state: control pane starts expanded (not collapsed)
    const initialCollapsed = true;

    // Apply initial state
    if (initialCollapsed) {
        paneContent.classList.add('collapsed');
        toggleIcon.textContent = '▼';
    } else {
        paneContent.classList.remove('collapsed');
        toggleIcon.textContent = '▲';
    }
    updateAlertPosition();

    toggleBtn.addEventListener('click', () => {
        paneContent.classList.toggle('collapsed');

        // Toggle icon between ▼ (collapsed) and ▲ (expanded)
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

    // Initial state: YAML panel starts collapsed (not expanded)
    const initialExpanded = false;

    // Apply initial state
    if (initialExpanded) {
        yamlPanel.classList.add('expanded');
    } else {
        yamlPanel.classList.remove('expanded');
    }

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
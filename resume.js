// ==================== CONFIGURATION & SCHEMA ====================
// This replaces the hardcoded renderer functions with a schema-based system

const DOCUMENT_SCHEMA = {
  templates: {
    contact: {
      name: "Contact Header",
      fields: ["name", "full_name", "location", "email", "linkedin", "github"],
      render: "contact-header",
    },
    summary: {
      name: "Summary Block",
      fields: ["content"],
      render: "inline-summary",
    },
    education: {
      name: "Education List",
      items: ["institution", "degree", "graduation_date", "campus"],
      render: "item-list",
    },
    skills: {
      name: "Skills with Categories",
      hasCategories: true,
      categoryStructure: { _title: "", _items: [] },
      render: "categorized-list",
    },
    work: {
      name: "Work Experience",
      items: ["title", "company", "duration", "responsibilities"],
      render: "experience-item",
    },
    research: {
      name: "Research Experience",
      items: [
        "title",
        "institution",
        "type",
        "description",
        "technical_environment",
        "applied_methods",
      ],
      render: "research-item",
    },
    certificates: {
      name: "Certificates",
      items: ["name", "institution", "verification_url"],
      render: "certificate-item",
    },
    publications: {
      name: "Publications",
      fields: ["note", "scholar_url"],
      render: "publications-block",
    },
    "cover-letter": {
      name: "Cover Letter",
      fields: [
        "date",
        "recipient_name",
        "recipient_title",
        "company",
        "body",
        "closing",
      ],
      render: "letter-block",
    },
  },

  renderers: {
    "contact-header": renderContactHeader,
    "inline-summary": renderInlineSummary,
    "item-list": renderItemList,
    "categorized-list": renderCategorizedList,
    "experience-item": renderExperienceItem,
    "research-item": renderResearchItem,
    "certificate-item": renderCertificateItem,
    "publications-block": renderPublicationsBlock,
    "letter-block": renderCoverLetter,
    custom: renderCustom,
  },
};

// ==================== THEME SYSTEM ====================

const THEMES = {
  professional: {
    name: "Professional",
    colors: {
      primary: "#2c3e50",
      secondary: "#34495e",
      accent: "#3498db",
      text: "#000",
      background: "#fff",
      divider: "#bdc3c7",
    },
    fonts: {
      heading: "'Times New Roman', serif",
      body: "'Times New Roman', serif",
    },
    layout: "single-column",
  },

  modern: {
    name: "Modern Two-Column",
    colors: {
      primary: "#1a1a1a",
      secondary: "#f5f5f5",
      accent: "#00d4ff",
      text: "#333",
      background: "#fff",
      divider: "#e0e0e0",
    },
    fonts: {
      heading: "'Arial', sans-serif",
      body: "'Arial', sans-serif",
    },
    layout: "two-column",
  },

  creative: {
    name: "Creative Portfolio",
    colors: {
      primary: "#2d5016",
      secondary: "#6b8e23",
      accent: "#f4a460",
      text: "#fff",
      background: "#f9f7f4",
      divider: "#d4af37",
    },
    fonts: {
      heading: "'Georgia', serif",
      body: "'Trebuchet MS', sans-serif",
    },
    layout: "sidebar",
  },

  minimal: {
    name: "Minimal Clean",
    colors: {
      primary: "#000",
      secondary: "#f0f0f0",
      accent: "#666",
      text: "#000",
      background: "#fff",
      divider: "#ddd",
    },
    fonts: {
      heading: "'Helvetica', sans-serif",
      body: "'Helvetica', sans-serif",
    },
    layout: "single-column",
  },

  fashion: {
    name: "Fashion Designer",
    colors: {
      primary: "#c4b5a0",
      secondary: "#2d4a3d",
      accent: "#d4a574",
      text: "#1a1a1a",
      background: "#f5f1ed",
      divider: "#b8a89a",
    },
    fonts: {
      heading: "'Playfair Display', serif",
      body: "'Lato', sans-serif",
    },
    layout: "two-column",
  },
};

let currentTheme = "professional";
// ==================== TEMPLATE PRESETS ====================
const TEMPLATE_PRESETS = {
  "empty-resume": `personal_info:
  _type: contact
  name: Your Name
  email: your.email@example.com
  linkedin: linkedin.com/in/yourprofile
  github: github.com/yourprofile

summary:
  _type: summary
  _title: Summary
  content: Your professional summary here

education:
  _type: education
  _title: Education
  items:
    - degree: Your Degree
      institution: Your University
      graduation_date: "May 2024"

work_experience:
  _type: work
  _title: Experience
  items:
    - title: Your Job Title
      company: Company Name
      duration: Jan 2024 - Present
      responsibilities:
        - Responsibility one
        - Responsibility two
`,

  "ats-resume": `personal_info:
  _type: contact
  name: Your Name
  email: your.email@example.com
  linkedin: linkedin.com/in/yourprofile

summary:
  _type: summary
  _title: Professional Summary
  content: |
    Results-driven professional with expertise in key skills.
    Proven track record of accomplishments.

education:
  _type: education
  _title: Education
  items:
    - degree: Bachelor of Science in Computer Science
      institution: State University
      graduation_date: "May 2024"

skills:
  _type: skills
  _title: Technical Skills
  programming:
    _title: Programming Languages
    _items: Python, JavaScript, Java, C++
  frameworks:
    _title: Frameworks
    _items: React, Django, FastAPI

work_experience:
  _type: work
  _title: Professional Experience
  items:
    - title: Software Engineer
      company: Tech Company
      duration: "Jan 2024 - Present"
      responsibilities:
        - Developed features using Python
        - Collaborated with cross-functional teams
`,

  "cover-letter": `personal_info:
  _type: contact
  name: Your Name
  email: your.email@example.com

letter_section:
  _type: cover-letter
  _title: Cover Letter
  date: October 2025
  recipient_name: John Smith
  recipient_title: Hiring Manager
  company: Tech Company Inc.
  body: |
    Dear Mr. Smith,

    I am writing to express my interest in the position of [Position Title] at [Company Name].

    With my background in [relevant skills], I am confident I can contribute to your team.

    Thank you for considering my application.
  closing: Sincerely, Your Name
`,
};

function insertTemplate(presetKey) {
  const preset = TEMPLATE_PRESETS[presetKey];
  if (!preset) {
    console.warn(`Template "${presetKey}" not found`);
    return;
  }

  document.getElementById("yaml-editor").value = preset;

  // Trigger re-render
  const event = new Event("input", { bubbles: true });
  document.getElementById("yaml-editor").dispatchEvent(event);

  console.log(`Template "${presetKey}" loaded`);
}

/**
 * Apply theme globally
 */
function applyTheme(themeName) {
  const theme = THEMES[themeName];
  if (!theme) return;

  currentTheme = themeName;
  const root = document.documentElement;

  // Set CSS variables
  root.style.setProperty("--theme-primary", theme.colors.primary);
  root.style.setProperty("--theme-secondary", theme.colors.secondary);
  root.style.setProperty("--theme-accent", theme.colors.accent);
  root.style.setProperty("--theme-text", theme.colors.text);
  root.style.setProperty("--theme-background", theme.colors.background);
  root.style.setProperty("--theme-divider", theme.colors.divider);
  root.style.setProperty("--theme-heading-font", theme.fonts.heading);
  root.style.setProperty("--theme-body-font", theme.fonts.body);

  // Apply layout
  applyLayout(theme.layout);

  console.log(`Theme "${themeName}" applied`);
}

/**
 * Apply layout styles based on theme
 */
function applyLayout(layout) {
  const container = document.getElementById("resume-container");

  container.classList.remove("single-column", "two-column", "sidebar");
  container.classList.add(layout);

  // Apply theme-specific styles
  if (layout === "two-column") {
    container.style.display = "grid";
    container.style.gridTemplateColumns = "1fr 1fr";
    container.style.gap = "20px";
  } else if (layout === "sidebar") {
    container.style.display = "grid";
    container.style.gridTemplateColumns = "300px 1fr";
    container.style.gap = "30px";
  } else {
    container.style.display = "block";
  }
}

/**
 * Get section-specific styles from YAML
 */
function getSectionStyles(sectionData) {
  const customStyle = sectionData._style || {};
  return {
    backgroundColor: customStyle.background_color || "var(--theme-background)",
    color: customStyle.text_color || "var(--theme-text)",
    borderLeft: customStyle.border_left || "none",
    padding: customStyle.padding || "15px",
    margin: customStyle.margin || "15px 0",
    fontSize: customStyle.font_size || "1em",
    fontFamily: customStyle.font_family || "var(--theme-body-font)",
    ...customStyle.extra_css, // Allow arbitrary CSS
  };
}

/**
 * Convert style object to inline CSS string
 */
function stylesToCss(styleObj) {
  return Object.entries(styleObj)
    .map(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `${cssKey}: ${value}`;
    })
    .join("; ");
}

// ==================== CORE RENDERING ENGINE ====================

/**
 * Validate section against its template
 * Returns array of errors, or empty array if valid
 */
function validateSection(sectionData, template) {
  const errors = [];

  // Check required fields
  if (template.items && sectionData.items) {
    if (!Array.isArray(sectionData.items)) {
      errors.push(`Expected array for items, got ${typeof sectionData.items}`);
    }

    for (let i = 0; i < sectionData.items.length; i++) {
      const item = sectionData.items[i];
      for (const field of template.items) {
        if (!(field in item)) {
          console.warn(`Item ${i} missing field "${field}"`);
        }
      }
    }
  }

  return errors;
}

/**
 * Universal renderer that works with any document type
 * Steps: Load YAML → Validate → Render using schema → Display
 */
function renderDocument(data) {
  const container = document.getElementById("resume-container");
  let html = "";

  // Process each section in YAML order
  for (const [sectionKey, sectionData] of Object.entries(data)) {
    if (!sectionData || typeof sectionData !== "object") continue;

    const type = sectionData._type;
    const title = sectionData._title;
    const labels = sectionData._labels || {};

    if (!type) {
      console.warn(`Section "${sectionKey}" missing _type, skipping`);
      continue;
    }

    // Get template definition
    const template = DOCUMENT_SCHEMA.templates[type];
    if (!template) {
      console.warn(`Unknown template type "${type}"`);
      continue;
    }

    // Get the renderer function
    const rendererName = template.render;
    const renderer = DOCUMENT_SCHEMA.renderers[rendererName];
    if (!renderer) {
      console.warn(`Renderer "${rendererName}" not found`);
      continue;
    }

    // Extract content (remove metadata fields)
    const content = extractContent(sectionData);

    // Call the appropriate renderer
    try {
      html += renderer(content, title, labels, template);
    } catch (error) {
      console.error(`Error rendering section "${sectionKey}":`, error);
      html += `<div class="render-error">Error rendering ${title}</div>`;
    }
  }

  container.innerHTML = html;
}

/**
 * Extract non-metadata fields from a section
 */
function extractContent(sectionData) {
  const content = {};
  for (const [key, value] of Object.entries(sectionData)) {
    if (!key.startsWith("_")) {
      content[key] = value;
    }
  }
  return content;
}

// ==================== TEMPLATE RENDERERS ====================

function renderContactHeader(data, title, labels, template) {
  const styles = getSectionStyles(data);
  const contactItems = [
    data.location,
    data.email
      ? `<a href="mailto:${data.email}">${escapeHtml(data.email)}</a>`
      : null,
    data.linkedin
      ? `<a href="https://${data.linkedin}" target="_blank">${escapeHtml(
          data.linkedin
        )}</a>`
      : null,
    data.github
      ? `<a href="https://${data.github}" target="_blank">${escapeHtml(
          data.github
        )}</a>`
      : null,
  ].filter(Boolean);

  return `
    <div class="header" style="${stylesToCss(styles)}">
      <h1 style="color: var(--theme-primary); font-family: var(--theme-heading-font);">
        ${escapeHtml(data.name || "")}
      </h1>
      ${
        data.full_name
          ? `<div class="subtitle" style="color: var(--theme-accent);">
              ${escapeHtml(data.full_name)}
            </div>`
          : ""
      }
      <div class="contact-info" style="color: var(--theme-text);">
        ${contactItems.join(" | ")}
      </div>
    </div>
  `;
}

function renderInlineSummary(data, title, labels, template) {
  return `
    <p class="summary-inline">
      <strong>${escapeHtml(title)}:</strong> ${parseFormatting(
    data.content || ""
  )}
    </p>
  `;
}

function renderItemList(data, title, labels, template) {
  if (!data.items || !Array.isArray(data.items)) {
    return `<div class="section"><h2>${escapeHtml(
      title
    )}</h2><p>No items</p></div>`;
  }

  const styles = getSectionStyles(data);

  const itemsHtml = data.items
    .map((item) => {
      if (item.degree) {
        return `
        <div class="education-item" style="border-left: 3px solid var(--theme-accent); padding-left: 15px; margin-bottom: 10px;">
          <span class="date" style="color: var(--theme-accent); font-weight: bold;">
            ${escapeHtml(item.graduation_date || "")}
          </span>
          <div class="degree" style="font-weight: bold; color: var(--theme-primary);">
            ${escapeHtml(item.degree || "")}
          </div>
          <div class="institution" style="color: var(--theme-text);">
            ${escapeHtml(item.institution || "")}
            ${item.campus ? ` - ${escapeHtml(item.campus)}` : ""}
          </div>
        </div>
      `;
      }
      if (item.name && !item.title) {
        return `
        <div class="certificate-item" style="padding: 10px; background: var(--theme-secondary); margin-bottom: 10px; border-radius: 4px;">
          <div class="certificate-name" style="font-weight: bold; color: var(--theme-primary);">
            ${escapeHtml(item.name)}
          </div>
          <span class="certificate-institution" style="color: var(--theme-accent);">
            ${escapeHtml(item.institution || "")}
          </span>
        </div>
      `;
      }
      return `<div class="item">${JSON.stringify(item)}</div>`;
    })
    .join("");

  return `
    <div class="section" style="${stylesToCss(styles)}">
      <h2 class="section-title" style="color: var(--theme-primary); border-bottom-color: var(--theme-divider); font-family: var(--theme-heading-font);">
        ${escapeHtml(title)}
      </h2>
      ${itemsHtml}
    </div>
  `;
}

function renderCategorizedList(data, title, labels, template) {
  let html = `<div class="section"><h2 class="section-title">${escapeHtml(
    title
  )}</h2>`;

  for (const [categoryKey, categoryData] of Object.entries(data)) {
    if (
      categoryKey.startsWith("_") ||
      !categoryData ||
      typeof categoryData !== "object"
    )
      continue;

    const categoryTitle = categoryData._title;
    const categoryItems = categoryData._items;

    if (!categoryTitle || !categoryItems) continue;

    const itemsStr = normalizeItems(categoryItems);
    html += `
      <div class="skills-category">
        <strong>${escapeHtml(categoryTitle)}:</strong>
        <span class="skills-list">${parseFormatting(itemsStr)}</span>
      </div>
    `;
  }

  html += "</div>";
  return html;
}

function renderExperienceItem(data, title, labels, template) {
  if (!data.items || !Array.isArray(data.items)) {
    return `<div class="section"><h2>${escapeHtml(
      title
    )}</h2><p>No items</p></div>`;
  }

  const styles = getSectionStyles(data);

  const itemsHtml = data.items
    .map(
      (exp) => `
    <div class="experience-item" style="border-left: 3px solid var(--theme-accent); padding-left: 15px; margin-bottom: 15px;">
      <div class="experience-header" style="display: flex; justify-content: space-between;">
        <div>
          <span class="job-title" style="font-weight: bold; color: var(--theme-primary); font-family: var(--theme-heading-font);">
            ${escapeHtml(exp.title || "")}
          </span>
          <span class="company" style="color: var(--theme-accent);"> || ${escapeHtml(
            exp.company || ""
          )}
          </span>
        </div>
        <div class="duration" style="color: var(--theme-text); font-style: italic;">
          ${escapeHtml(exp.duration || "")}
        </div>
      </div>
      ${
        exp.responsibilities && exp.responsibilities.length > 0
          ? `
        <ul class="responsibilities" style="margin-top: 8px; margin-left: 20px;">
          ${exp.responsibilities
            .map(
              (r) =>
                `<li style="color: var(--theme-text); margin-bottom: 4px;">
                  ${parseFormatting(r)}
                </li>`
            )
            .join("")}
        </ul>
      `
          : ""
      }
    </div>
  `
    )
    .join("");

  return `
    <div class="section" style="${stylesToCss(styles)}">
      <h2 class="section-title" style="color: var(--theme-primary); border-bottom-color: var(--theme-divider); font-family: var(--theme-heading-font);">
        ${escapeHtml(title)}
      </h2>
      ${itemsHtml}
    </div>
  `;
}

function renderResearchItem(data, title, labels, template) {
  if (!data.items || !Array.isArray(data.items)) {
    return `<div class="section"><h2>${escapeHtml(
      title
    )}</h2><p>No items</p></div>`;
  }

  const itemsHtml = data.items
    .map((item) => {
      let html = '<div class="research-item">';
      html += `<div class="research-title">${escapeHtml(item.title || "")}`;
      if (item.references) html += ` ${escapeHtml(item.references)}`;
      html += "</div>";

      html += '<div class="research-type">';
      html += escapeHtml(item.institution || "");
      if (item.type) html += ` | ${escapeHtml(item.type)}`;
      html += "</div>";

      if (item.description) {
        html += `<div class="research-description">${parseFormatting(
          item.description
        )}</div>`;
      }

      if (item.technical_environment) {
        html += `
        <div class="applied-methods">
          <em>${escapeHtml(
            labels.technical_environment || "Technical Environment"
          )}:</em>
          ${parseFormatting(item.technical_environment)}
        </div>
      `;
      }

      if (item.applied_methods) {
        const methodsStr =
          typeof item.applied_methods === "string"
            ? parseFormatting(item.applied_methods)
            : item.applied_methods.map((m) => escapeHtml(m)).join(" | ");
        html += `
        <div class="applied-methods">
          <em>${escapeHtml(labels.applied_methods || "Applied Methods")}:</em>
          <span class="methods-list">${methodsStr}</span>
        </div>
      `;
      }

      html += "</div>";
      return html;
    })
    .join("");

  return `
    <div class="section">
      <h2 class="section-title">${escapeHtml(title)}</h2>
      ${itemsHtml}
    </div>
  `;
}

function renderCertificateItem(data, title, labels, template) {
  if (!data.items || !Array.isArray(data.items)) {
    return `<div class="section"><h2>${escapeHtml(
      title
    )}</h2><p>No items</p></div>`;
  }

  const itemsHtml = data.items
    .map(
      (cert) => `
    <div class="certificate-item">
      <div class="certificate-name">${escapeHtml(cert.name || "")}</div>
      <span class="certificate-institution">${escapeHtml(
        cert.institution || ""
      )}</span>
      ${
        cert.verification_url
          ? `
        <a href="${
          cert.verification_url
        }" target="_blank" class="certificate-link">
          ${escapeHtml(labels.verification_url || "Verify")}
        </a>
      `
          : ""
      }
    </div>
  `
    )
    .join("");

  return `
    <div class="section">
      <h2 class="section-title">${escapeHtml(title)}</h2>
      ${itemsHtml}
    </div>
  `;
}

function renderPublicationsBlock(data, title, labels, template) {
  let html = `<div class="section"><h2 class="section-title">${escapeHtml(
    title
  )}</h2>`;

  if (data.note) {
    html += `<div class="publications-note">${parseFormatting(
      data.note
    )}</div>`;
  }

  if (data.scholar_url) {
    html += `
      <a href="${data.scholar_url}" target="_blank" class="publications-link">
        ${escapeHtml(labels.scholar_url || "Google Scholar")}
      </a>
    `;
  }

  html += "</div>";
  return html;
}

// ==================== THEME SELECTOR IN UI ====================

function setupThemeSelector() {
  const container = document.getElementById("pane-content");

  if (!document.getElementById("theme-selector")) {
    const themeSection = document.createElement("div");
    themeSection.className = "pane-section";
    themeSection.innerHTML = `
      <div class="pane-section-title">Theme</div>
      <select id="theme-selector" class="document-selector">
        ${Object.entries(THEMES)
          .map(
            ([key, theme]) => `<option value="${key}">${theme.name}</option>`
          )
          .join("")}
      </select>
    `;

    // Insert after document type selector
    const docSelector = document.querySelector(".document-selector");
    if (docSelector) {
      docSelector.parentElement.parentElement.insertAdjacentElement(
        "afterend",
        themeSection
      );
    }

    document
      .getElementById("theme-selector")
      .addEventListener("change", (e) => {
        applyTheme(e.target.value);
        // Re-render with new theme
        let yamlText = document.getElementById("yaml-editor").value;
        try {
          yamlText = yamlText.replace(/(\s+- )(\*{2}.+)$/gm, '$1"$2"');
          const data = jsyaml.load(yamlText);
          renderDocument(data);
        } catch (error) {
          console.error("Error re-rendering:", error);
        }
      });
  }
}

/**
 * Render a cover letter section
 */
function renderCoverLetter(data, title, labels, template) {
  return `
    <div class="letter">
      <div class="letter-date">${escapeHtml(data.date || "")}</div>
      <div class="letter-recipient">
        ${escapeHtml(data.recipient_name || "")}<br>
        ${escapeHtml(data.recipient_title || "")}<br>
        ${escapeHtml(data.company || "")}
      </div>
      <div class="letter-body">${parseFormatting(data.body || "")}</div>
      <div class="letter-closing">${escapeHtml(data.closing || "")}</div>
    </div>
  `;
}

/**
 * Catch-all renderer for unknown section types
 */
function renderCustom(data, title, labels, template) {
  return `
    <div class="section">
      <h2 class="section-title">${escapeHtml(title)}</h2>
      <div class="custom-section">
        <pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>
      </div>
    </div>
  `;
}

// ==================== UTILITY FUNCTIONS ====================

function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  const div = document.createElement("div");
  div.textContent = text.toString();
  return div.innerHTML;
}

function parseFormatting(text) {
  if (!text) return "";
  text = escapeHtml(text);
  text = text.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");
  text = text.replace(/__(.+?)__/g, "<u>$1</u>");
  return text;
}

function normalizeItems(items, delimiter = ", ") {
  if (!items) return "";
  if (typeof items === "string") return items;
  if (Array.isArray(items)) return items.join(delimiter);
  return String(items);
}

// ==================== DOCUMENT LOADER ====================

let originalYamlText = "";
let currentDocumentType = "resume";

async function loadDocument(docType) {
  currentDocumentType = docType;

  try {
    let filename = "resume.yml";

    if (docType === "portfolio") {
      filename = "portfolio.yml";
    } else if (docType === "cover_letter") {
      filename = "cover-letter.yml";
    }

    const response = await fetch(filename);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.statusText}`);
    }

    let yamlText = await response.text();
    originalYamlText = yamlText;

    yamlText = yamlText.replace(/(\s+- )(\*{2}.+)$/gm, '$1"$2"');

    const data = jsyaml.load(yamlText);
    renderDocument(data);

    document.querySelector(".loading").style.display = "none";
    document.getElementById("main-content").style.display = "flex";
    document.getElementById("control-pane").style.display = "block";
    document.getElementById("yaml-editor").value = originalYamlText;

    setupSaveButtons();
    setupControlSliders();
    setupPaneToggle();
    setupYamlEditor();
  } catch (error) {
    document.querySelector(".loading").innerHTML = `
      <div style="color: #e74c3c;">
        <h2>Error Loading Document</h2>
        <p>${error.message}</p>
        <p>Make sure you have the correct file (${docType}) in your directory</p>
      </div>
    `;
    console.error("Error:", error);
  }
}

async function loadResume() {
  loadDocument("resume");
}

// ==================== EVENT HANDLERS ====================

function setupSaveButtons() {
  document
    .getElementById("save-html-btn")
    .addEventListener("click", saveAsHTML);
  document.getElementById("save-pdf-btn").addEventListener("click", saveAsPDF);

  const saveJsonBtn = document.getElementById("save-json-btn");
  if (saveJsonBtn) {
    saveJsonBtn.addEventListener("click", saveAsJSON);
  }
}

function setupControlSliders() {
  const rootStyles = getComputedStyle(document.documentElement);
  const fontSchemes = {};

  for (let i = 1; i <= 3; i++) {
    fontSchemes[i] = {
      base: rootStyles.getPropertyValue(`--scheme-${i}-base`).trim(),
      medium: rootStyles.getPropertyValue(`--scheme-${i}-medium`).trim(),
      large: rootStyles.getPropertyValue(`--scheme-${i}-large`).trim(),
      label: rootStyles
        .getPropertyValue(`--scheme-${i}-label`)
        .trim()
        .replace(/['"]/g, ""),
    };
  }

  const marginOptions = ["0.2in", "0.3in", "0.4in", "0.5in"];

  const fontSlider = document.getElementById("font-size-slider");
  const fontLabel = document.getElementById("font-size-label");

  fontSlider.addEventListener("input", (e) => {
    const scheme = fontSchemes[e.target.value];
    document.documentElement.style.setProperty("--font-base", scheme.base);
    document.documentElement.style.setProperty("--font-medium", scheme.medium);
    document.documentElement.style.setProperty("--font-large", scheme.large);
    fontLabel.textContent = scheme.label;
  });

  const marginSlider = document.getElementById("margin-slider");
  const marginLabel = document.getElementById("margin-label");

  marginSlider.addEventListener("input", (e) => {
    const margin = marginOptions[parseInt(e.target.value)];
    document.getElementById("resume-container").style.padding = margin;
    marginLabel.textContent = margin;
  });
}

function setupPaneToggle() {
  const toggleBtn = document.getElementById("toggle-pane-btn");
  const paneContent = document.getElementById("pane-content");
  toggleBtn.addEventListener("click", () => {
    paneContent.classList.toggle("collapsed");
  });
}

function setupYamlEditor() {
  const yamlPanel = document.getElementById("yaml-panel");
  const toggleYamlBtn = document.getElementById("toggle-yaml-btn");
  const yamlEditor = document.getElementById("yaml-editor");
  const copyYamlBtn = document.getElementById("copy-yaml-btn");
  let renderTimeout = null;

  toggleYamlBtn.addEventListener("click", () => {
    yamlPanel.classList.toggle("expanded");
  });

  copyYamlBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(yamlEditor.value);
      const originalText = copyYamlBtn.textContent;
      copyYamlBtn.textContent = "Copied!";
      setTimeout(() => {
        copyYamlBtn.textContent = originalText;
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  });

  yamlEditor.addEventListener("input", () => {
    if (renderTimeout) clearTimeout(renderTimeout);

    renderTimeout = setTimeout(() => {
      try {
        let yamlText = yamlEditor.value;
        yamlText = yamlText.replace(/(\s+- )(\*{2}.+)$/gm, '$1"$2"');
        const data = jsyaml.load(yamlText);
        renderDocument(data);
        yamlEditor.style.borderLeft = "";
      } catch (error) {
        console.error("YAML parsing error:", error);
        yamlEditor.style.borderLeft = "3px solid #e74c3c";
      }
    }, 500);
  });

  yamlEditor.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = yamlEditor.selectionStart;
      const end = yamlEditor.selectionEnd;
      const value = yamlEditor.value;
      yamlEditor.value =
        value.substring(0, start) + "  " + value.substring(end);
      yamlEditor.selectionStart = yamlEditor.selectionEnd = start + 2;
    }
  });
}

function saveAsHTML() {
  const resumeContent = document.getElementById("resume-container").innerHTML;
  fetch("style.css")
    .then((response) => response.text())
    .then((cssContent) => {
      const nameElement = document.querySelector(".header h1");
      const filename = nameElement
        ? nameElement.textContent.replace(/\s+/g, "_") + ".html"
        : "document.html";

      const completeHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <style>
    ${cssContent}
    #control-pane, .yaml-panel, .toggle-btn { display: none !important; }
    body { padding: 20px; }
  </style>
</head>
<body>
  <div id="resume-container">${resumeContent}</div>
</body>
</html>`;

      const blob = new Blob([completeHTML], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
}

function saveAsPDF() {
  window.print();
}

function saveAsJSON() {
  const yamlText = document.getElementById("yaml-editor").value;
  const data = jsyaml.load(yamlText);

  const nameElement = document.querySelector(".header h1");
  const filename = nameElement
    ? nameElement.textContent.replace(/\s+/g, "_") + ".json"
    : "document.json";

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

document.addEventListener("DOMContentLoaded", loadResume);

// Initialize theme selector after page load
setTimeout(() => {
  setupThemeSelector();
  applyTheme(currentTheme);
}, 500);

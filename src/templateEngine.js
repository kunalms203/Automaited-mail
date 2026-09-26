const fs = require("fs");
const path = require("path");
const config = require("./config");

class TemplateEngine {
  constructor(templatesDir = path.resolve(__dirname, "..", "templates")) {
    this.templatesDir = templatesDir;
    this.cache = new Map();
  }

  /**
   * Load template file from disk (cached).
   * @param {string} templateName
   * @returns {string}
   */
  _loadTemplate(templateName) {
    if (this.cache.has(templateName)) {
      return this.cache.get(templateName);
    }

    const filePath = path.isAbsolute(templateName)
      ? templateName
      : path.join(this.templatesDir, `${templateName}.html`);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Template not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, "utf8");
    this.cache.set(templateName, content);
    return content;
  }

  /**
   * Replace {{variable}} tags and handle simple {{#if condition}} blocks.
   * @param {string} content
   * @param {Record<string, any>} data
   * @returns {string}
   */
  interpolate(content, data) {
    let result = content;

    // Handle {{#if key}}...{{/if}}
    result = result.replace(/\{\{#if\s+([a-zA-Z0-9_]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, key, inner) => {
      const val = data[key];
      return val && String(val).trim() !== "" ? inner : "";
    });

    // Replace {{key}}
    result = result.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (match, key) => {
      return data[key] !== undefined && data[key] !== null ? String(data[key]) : "";
    });

    return result;
  }

  /**
   * Strip HTML tags and convert to clean plain text.
   * @param {string} html
   * @returns {string}
   */
  htmlToText(html) {
    let text = html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "")
      .replace(/<br\s*[\/]?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<li>/gi, "• ")
      .replace(/<\/li>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");

    return text
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  /**
   * Build complete context combining candidate info, job details, and recipient data.
   * @param {object} recipient
   * @param {object} jobDetails
   * @returns {object}
   */
  buildContext(recipient, jobDetails = {}) {
    const candidate = config.candidate;
    return {
      name: recipient.name || "Hiring Manager",
      recipientEmail: recipient.email,
      companyName: recipient.companyName || jobDetails.companyName || "your company",
      jobTitle: recipient.jobTitle || jobDetails.jobTitle || "Software Engineer",
      jobId: recipient.jobId || jobDetails.jobId || "",
      jobLocation: recipient.jobLocation || jobDetails.jobLocation || "",
      jobLink: recipient.jobLink || jobDetails.jobLink || "",
      // Candidate info
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      candidatePhone: candidate.phone,
      candidateLinkedIn: candidate.linkedin,
      candidateGitHub: candidate.github,
      candidateDegree: candidate.education,
      candidateExperience: candidate.experience,
      languages: candidate.skills.languages,
      frontend: candidate.skills.frontend,
      backend: candidate.skills.backend,
      databases: candidate.skills.databases,
      tools: candidate.skills.tools,
    };
  }

  /**
   * Render subject line and both HTML and Text email bodies.
   * @param {string} templateName - 'job-application' | 'referral-request' | 'cold-outreach' or custom path
   * @param {object} recipient
   * @param {object} jobDetails
   * @param {string} [customSubject]
   * @returns {{ subject: string, html: string, text: string }}
   */
  render(templateName, recipient, jobDetails = {}, customSubject = null) {
    const context = this.buildContext(recipient, jobDetails);
    const templateContent = this._loadTemplate(templateName);

    const html = this.interpolate(templateContent, context);
    const text = this.htmlToText(html);

    let subject = customSubject;
    if (!subject) {
      if (templateName.includes("referral")) {
        subject = context.jobId
          ? `Referral Request for ${context.jobTitle} (${context.jobId}) - ${context.candidateName}`
          : `Referral Request for ${context.jobTitle} - ${context.candidateName}`;
      } else if (templateName.includes("outreach")) {
        subject = `Introduction & Exploring Opportunities at ${context.companyName} - ${context.candidateName}`;
      } else {
        subject = `Application for ${context.jobTitle} - ${context.candidateName}`;
      }
    } else {
      subject = this.interpolate(subject, context);
    }

    return { subject, html, text };
  }
}

module.exports = new TemplateEngine();

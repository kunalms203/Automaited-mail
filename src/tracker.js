const fs = require("fs");
const path = require("path");
const config = require("./config");

class Tracker {
  constructor(filePath = config.paths.sentHistory) {
    this.filePath = filePath;
    this._ensureFileExists();
  }

  _ensureFileExists() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), "utf8");
    }
  }

  _readHistory() {
    try {
      this._ensureFileExists();
      const raw = fs.readFileSync(this.filePath, "utf8");
      return JSON.parse(raw) || [];
    } catch {
      return [];
    }
  }

  _writeHistory(history) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(history, null, 2), "utf8");
    } catch (err) {
      console.error(`[Tracker] Error saving sent history: ${err.message}`);
    }
  }

  /**
   * Check if an email was already sent for a given campaign/role.
   * @param {string} email
   * @param {string} [campaignId]
   * @returns {boolean}
   */
  isAlreadySent(email, campaignId = null) {
    if (!email) return false;
    const history = this._readHistory();
    const normalizedEmail = email.trim().toLowerCase();

    return history.some((entry) => {
      const matchEmail = entry.email.toLowerCase() === normalizedEmail;
      if (!campaignId) return matchEmail;
      return matchEmail && (!entry.campaignId || entry.campaignId === campaignId);
    });
  }

  /**
   * Record a successfully sent email.
   * @param {string} email
   * @param {object} details
   */
  recordSent(email, details = {}) {
    const history = this._readHistory();
    const entry = {
      email: email.trim().toLowerCase(),
      name: details.name || "",
      campaignId: details.campaignId || "general",
      companyName: details.companyName || "",
      jobTitle: details.jobTitle || "",
      messageId: details.messageId || null,
      timestamp: new Date().toISOString(),
    };

    history.push(entry);
    this._writeHistory(history);
  }

  /**
   * Get all sent records.
   * @returns {Array}
   */
  getHistory() {
    return this._readHistory();
  }

  /**
   * Clear sent history.
   */
  clearHistory() {
    this._writeHistory([]);
  }
}

module.exports = new Tracker();

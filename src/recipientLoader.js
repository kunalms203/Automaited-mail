const fs = require("fs");
const path = require("path");
const { isValidEmail } = require("./validator");

/**
 * Robust lightweight CSV parser that handles quoted strings and comma delimiters.
 * @param {string} csvText
 * @returns {Array<object>}
 */
function parseCsv(csvText) {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const rawValues = parseCsvLine(lines[i]);
    if (rawValues.length === 0 || (rawValues.length === 1 && !rawValues[0].trim())) {
      continue;
    }

    const row = {};
    headers.forEach((header, index) => {
      // Map standard column name aliases
      let key = header;
      if (key === "company") key = "companyName";
      if (key === "role" || key === "title") key = "jobTitle";
      if (key === "job_id" || key === "jobid") key = "jobId";
      if (key === "link" || key === "job_link" || key === "joburl") key = "jobLink";
      if (key === "location") key = "jobLocation";

      row[key] = (rawValues[index] || "").trim();
    });

    if (row.email) {
      rows.push(row);
    }
  }

  return rows;
}

/**
 * Parse a single CSV line respecting quotes.
 * @param {string} line
 * @returns {string[]}
 */
function parseCsvLine(line) {
  const values = [];
  let currentValue = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        currentValue += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(currentValue);
      currentValue = "";
    } else {
      currentValue += char;
    }
  }
  values.push(currentValue);
  return values;
}

/**
 * Load recipients from a file (CSV or JSON) or validate an in-memory array.
 * @param {string|Array<object>} source - File path or array of recipients
 * @returns {{ recipients: Array<object>, warnings: string[] }}
 */
function loadRecipients(source) {
  const warnings = [];
  let rawList = [];

  if (Array.isArray(source)) {
    rawList = source;
  } else if (typeof source === "string") {
    const resolvedPath = path.resolve(source);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Recipients file not found at: ${resolvedPath}`);
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const content = fs.readFileSync(resolvedPath, "utf8");

    if (ext === ".csv") {
      rawList = parseCsv(content);
    } else if (ext === ".json") {
      try {
        rawList = JSON.parse(content);
        if (!Array.isArray(rawList)) {
          throw new Error("JSON file root must be an array of recipient objects.");
        }
      } catch (err) {
        throw new Error(`Failed to parse JSON recipients: ${err.message}`);
      }
    } else {
      throw new Error(`Unsupported recipient file format "${ext}". Please use .csv or .json.`);
    }
  } else {
    throw new Error("Invalid recipient source. Must be a file path string or array.");
  }

  // Deduplicate and validate
  const seenEmails = new Set();
  const validRecipients = [];

  for (const item of rawList) {
    if (!item || !item.email) {
      warnings.push(`Skipped record without email: ${JSON.stringify(item)}`);
      continue;
    }

    const cleanEmail = item.email.trim();

    if (!isValidEmail(cleanEmail)) {
      warnings.push(`Invalid email syntax: "${cleanEmail}" (Name: ${item.name || "N/A"})`);
      continue;
    }

    const normalized = cleanEmail.toLowerCase();
    if (seenEmails.has(normalized)) {
      warnings.push(`Duplicate email found in list, skipping: "${cleanEmail}"`);
      continue;
    }

    seenEmails.add(normalized);
    validRecipients.push({
      ...item,
      name: (item.name || "").trim(),
      email: cleanEmail,
    });
  }

  return { recipients: validRecipients, warnings };
}

module.exports = {
  loadRecipients,
  parseCsv,
};

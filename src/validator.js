const fs = require("fs");
const path = require("path");

/**
 * Validates whether an email string conforms to standard RFC 5322 format.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim();
  // Standard robust email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(trimmed);
}

/**
 * Verifies that an attachment file exists, is readable, and is non-empty.
 * @param {string} filePath
 * @returns {{ valid: boolean, error?: string, sizeBytes?: number, fileName?: string }}
 */
function verifyAttachment(filePath) {
  if (!filePath) {
    return { valid: false, error: "No attachment path specified." };
  }

  const resolved = path.resolve(filePath);

  if (!fs.existsSync(resolved)) {
    return {
      valid: false,
      error: `Attachment not found at: ${resolved}`,
    };
  }

  try {
    const stats = fs.statSync(resolved);
    if (!stats.isFile()) {
      return { valid: false, error: `Path is not a regular file: ${resolved}` };
    }
    if (stats.size === 0) {
      return { valid: false, error: `Attachment file is empty (0 bytes): ${resolved}` };
    }
    return {
      valid: true,
      sizeBytes: stats.size,
      fileName: path.basename(resolved),
      resolvedPath: resolved,
    };
  } catch (err) {
    return { valid: false, error: `Unable to access attachment: ${err.message}` };
  }
}

module.exports = {
  isValidEmail,
  verifyAttachment,
};

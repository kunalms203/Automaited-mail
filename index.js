#!/usr/bin/env node

const path = require("path");
const { sendCampaign } = require("./src/sender");
const config = require("./src/config");

// Default application recipients
const defaultRecipients = [
  { name: "Arzoo", email: "arzoo@wednesday.is" },
  { name: "Shubhangi Mathur", email: "shubhangi.mathur@wednesday.is" },
];

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    force: false,
    file: null,
    campaign: "job-application",
    jobTitle: "Junior Full Stack Developer (Pune)",
    companyName: "Stackfusion Private Limited",
    jobId: "",
    jobLink: "",
    jobLocation: "Pune, India",
    attachmentPath: config.paths.defaultResume,
    authType: "auto",
    delayMs: config.limits.defaultDelayMs,
    batchSize: config.limits.defaultBatchSize,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--force") {
      options.force = true;
    } else if (arg === "--file" && args[i + 1]) {
      options.file = args[++i];
    } else if (arg === "--campaign" && args[i + 1]) {
      const c = args[++i].toLowerCase();
      if (c === "referral") options.campaign = "referral-request";
      else if (c === "outreach") options.campaign = "cold-outreach";
      else options.campaign = "job-application";
    } else if (arg === "--company" && args[i + 1]) {
      options.companyName = args[++i];
    } else if (arg === "--role" && args[i + 1]) {
      options.jobTitle = args[++i];
    } else if (arg === "--resume" && args[i + 1]) {
      options.attachmentPath = path.resolve(args[++i]);
    } else if (arg === "--auth" && args[i + 1]) {
      options.authType = args[++i];
    } else if (arg === "--delay" && args[i + 1]) {
      options.delayMs = parseInt(args[++i], 10);
    } else if (arg === "--batch" && args[i + 1]) {
      options.batchSize = parseInt(args[++i], 10);
    } else if (arg === "--help" || arg === "-h") {
      console.log(`
📧 Automated Email Sender CLI

Usage:
  node index.js [options]

Options:
  --dry-run            Simulate sending without dispatching real emails
  --force              Ignore sent history (re-send to previously contacted recipients)
  --file <path>        Path to CSV or JSON recipients file (e.g. --file data/recipients.sample.csv)
  --campaign <type>    Campaign template: 'application' | 'referral' | 'outreach' (default: application)
  --company <name>     Target company name (default: "Stackfusion Private Limited")
  --role <title>       Job position title (default: "Junior Full Stack Developer (Pune)")
  --resume <path>      Path to PDF resume (default: attachments/Kunal_Shinde_Resume.pdf)
  --auth <type>        Auth method: 'auto' | 'app_password' | 'oauth2'
  --delay <ms>         Delay between emails in milliseconds (default: 2000)
  --batch <size>       Number of emails per batch before pausing (default: 20)
  --help, -h           Show this help message

Examples:
  node index.js --dry-run
  node index.js --file data/recipients.sample.csv --dry-run
  node index.js --campaign referral --file data/kaplan-referrals.json
      `);
      process.exit(0);
    }
  }

  return options;
}

async function main() {
  const options = parseArgs();
  const recipients = options.file || defaultRecipients;

  try {
    await sendCampaign({
      recipients,
      template: options.campaign,
      jobDetails: {
        jobTitle: options.jobTitle,
        companyName: options.companyName,
        jobId: options.jobId,
        jobLink: options.jobLink,
        jobLocation: options.jobLocation,
      },
      attachmentPath: options.attachmentPath,
      dryRun: options.dryRun,
      force: options.force,
      delayMs: options.delayMs,
      batchSize: options.batchSize,
      authType: options.authType,
    });
  } catch (err) {
    console.error(`\n❌ Execution terminated with error: ${err.message}`);
    process.exit(1);
  }
}

main();

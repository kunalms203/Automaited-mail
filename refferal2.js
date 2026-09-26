#!/usr/bin/env node

const path = require("path");
const { sendCampaign } = require("./src/sender");

// Load EY referrals list
const eyRecipients = require("./data/ey-referrals.json");

const jobDetails = {
  jobTitle: "DET - Associate Software Engineer - GDSN02",
  jobLocation: "Bangalore, KA, India",
  jobId: "1612041",
  jobLink: "https://eyglobal.yello.co/jobs/0Iy0Oeg60FgeeOOcQQugBw",
  companyName: "EY",
};

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const isForce = args.includes("--force");

async function run() {
  try {
    await sendCampaign({
      recipients: eyRecipients,
      template: "referral-request",
      jobDetails,
      attachmentPath: path.join(__dirname, "attachments", "Kunal_Shinde_Resume2.pdf"),
      dryRun: isDryRun,
      force: isForce,
      authType: "oauth2",
      delayMs: 2000,
      batchSize: 20,
      batchDelayMs: 5 * 60 * 1000, // 5 minutes pause between batches
    });
  } catch (err) {
    console.error(`\n❌ EY referral campaign failed: ${err.message}`);
    process.exit(1);
  }
}

run();

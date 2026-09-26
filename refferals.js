#!/usr/bin/env node

const path = require("path");
const { sendCampaign } = require("./src/sender");
const config = require("./src/config");

// Load Kaplan referrals list
const kaplanRecipients = require("./data/kaplan-referrals.json");

const jobDetails = {
  jobTitle: "Associate Software Engineer (Internship Program to Full-time Employee)",
  jobLocation: "Bangalore, KA, India",
  jobId: "JR248715",
  jobLink: "https://ghc.wd1.myworkdayjobs.com/en-US/Kaplan_Careers/job/Associate-Software-Engineer--Internship-Program-to-Full-time-Employee-_JR248715-1",
  companyName: "Kaplan",
};

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const isForce = args.includes("--force");

async function run() {
  try {
    await sendCampaign({
      recipients: kaplanRecipients,
      template: "referral-request",
      jobDetails,
      attachmentPath: path.join(__dirname, "attachments", "Kunal_Shinde_Resume.pdf"),
      dryRun: isDryRun,
      force: isForce,
      authType: "app_password",
      delayMs: 2000,
      batchSize: 20,
      batchDelayMs: 5 * 60 * 1000, // 5 minutes
    });
  } catch (err) {
    console.error(`\n❌ Kaplan referral campaign failed: ${err.message}`);
    process.exit(1);
  }
}

run();

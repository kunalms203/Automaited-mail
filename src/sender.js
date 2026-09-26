const path = require("path");
const config = require("./config");
const { verifyAttachment } = require("./validator");
const { loadRecipients } = require("./recipientLoader");
const templateEngine = require("./templateEngine");
const tracker = require("./tracker");
const { createMailer } = require("./mailer");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Execute email dispatch campaign.
 *
 * @param {object} options
 * @param {string|Array<object>} options.recipients - Recipient list or file path (.csv, .json)
 * @param {string} [options.template='job-application'] - 'job-application' | 'referral-request' | 'cold-outreach'
 * @param {object} [options.jobDetails={}] - { jobTitle, companyName, jobId, jobLink, jobLocation }
 * @param {string} [options.attachmentPath] - Path to PDF resume
 * @param {boolean} [options.dryRun=false] - Simulate run without sending real emails
 * @param {boolean} [options.force=false] - Ignore sent history deduplication
 * @param {number} [options.delayMs] - Delay between emails in ms
 * @param {number} [options.batchSize] - Max emails per batch
 * @param {number} [options.batchDelayMs] - Delay between batches in ms
 * @param {'auto'|'app_password'|'oauth2'} [options.authType='auto']
 * @param {string} [options.customSubject]
 * @returns {Promise<{ total: number, sent: number, skipped: number, failed: number }>}
 */
async function sendCampaign(options = {}) {
  const {
    recipients: rawRecipients,
    template = "job-application",
    jobDetails = {},
    attachmentPath = config.paths.defaultResume,
    dryRun = false,
    force = false,
    delayMs = config.limits.defaultDelayMs,
    batchSize = config.limits.defaultBatchSize,
    batchDelayMs = config.limits.defaultBatchDelayMs,
    authType = "auto",
    customSubject = null,
  } = options;

  console.log("\n" + "=".repeat(65));
  console.log(`🚀 Automated Email Dispatch Engine`);
  if (dryRun) {
    console.log(`⚠️  MODE: DRY-RUN (Simulation only — NO emails will be sent)`);
  } else {
    console.log(`📧 MODE: LIVE (Sending real emails)`);
  }
  console.log("=".repeat(65));

  // 1. Verify Attachment
  let verifiedAttachment = null;
  if (attachmentPath) {
    const attachCheck = verifyAttachment(attachmentPath);
    if (!attachCheck.valid) {
      console.error(`❌ Attachment Error: ${attachCheck.error}`);
      if (!dryRun) {
        throw new Error(`Aborting due to invalid attachment: ${attachCheck.error}`);
      }
    } else {
      verifiedAttachment = attachCheck;
      console.log(`📎 Attachment: ${attachCheck.fileName} (${(attachCheck.sizeBytes / 1024).toFixed(1)} KB)`);
    }
  }

  // 2. Load & Validate Recipients
  const { recipients, warnings } = loadRecipients(rawRecipients);
  if (warnings.length > 0) {
    console.log(`\n⚠️  Recipient Warnings (${warnings.length}):`);
    warnings.slice(0, 5).forEach((w) => console.log(`   - ${w}`));
    if (warnings.length > 5) {
      console.log(`   ...and ${warnings.length - 5} more`);
    }
  }

  if (recipients.length === 0) {
    console.log("❌ No valid recipients found. Exiting.");
    return { total: 0, sent: 0, skipped: 0, failed: 0 };
  }

  console.log(`👥 Total Recipients Loaded: ${recipients.length}`);
  console.log(`⏱️  Individual Delay: ${delayMs / 1000}s | Batch Size: ${batchSize} (Batch Pause: ${batchDelayMs / 1000 / 60}m)`);
  console.log("-".repeat(65));

  // 3. Initialize Transporter (if live mode)
  let mailer = null;
  if (!dryRun) {
    try {
      mailer = await createMailer(authType);
      console.log(`🔒 Authenticated using: ${mailer.authMode}`);
      console.log(`📤 Sending from: ${mailer.senderEmail}`);
      console.log("-".repeat(65) + "\n");
    } catch (err) {
      console.error(`❌ Authentication Failed: ${err.message}`);
      throw err;
    }
  } else {
    console.log(`🔒 Authentication: Skipped for dry-run simulation\n`);
  }

  // 4. Processing Loop
  const stats = { total: recipients.length, sent: 0, skipped: 0, failed: 0 };
  const campaignKey = `${jobDetails.companyName || "general"}_${jobDetails.jobId || template}`;

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    const itemNum = `[${i + 1}/${recipients.length}]`;

    // Deduplication Check
    if (!force && tracker.isAlreadySent(recipient.email, campaignKey)) {
      console.log(`${itemNum} ⏭️  Skipped ${recipient.name || "Recipient"} (${recipient.email}) — Already contacted in this campaign.`);
      stats.skipped++;
      continue;
    }

    // Render Template
    let rendered;
    try {
      rendered = templateEngine.render(template, recipient, jobDetails, customSubject);
    } catch (err) {
      console.error(`${itemNum} ❌ Template Rendering Failed for ${recipient.email}: ${err.message}`);
      stats.failed++;
      continue;
    }

    const mailOptions = {
      from: `"${config.candidate.name}" <${mailer ? mailer.senderEmail : config.candidate.email}>`,
      to: recipient.email,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
      attachments: verifiedAttachment
        ? [
            {
              filename: verifiedAttachment.fileName,
              path: verifiedAttachment.resolvedPath,
            },
          ]
        : [],
    };

    if (dryRun) {
      console.log(`${itemNum} 🔍 [DRY-RUN PREVIEW]`);
      console.log(`   To: ${recipient.name} <${recipient.email}>`);
      console.log(`   Subject: ${mailOptions.subject}`);
      console.log(`   Attachment: ${mailOptions.attachments[0]?.filename || "None"}`);
      console.log(`   Preview: ${rendered.text.slice(0, 140).replace(/\n/g, " ")}...`);
      stats.sent++;
    } else {
      try {
        const info = await mailer.transporter.sendMail(mailOptions);
        console.log(`${itemNum} ✅ Sent to ${recipient.name} (${recipient.email}) | ID: ${info.messageId}`);
        stats.sent++;

        // Record sent log
        tracker.recordSent(recipient.email, {
          name: recipient.name,
          campaignId: campaignKey,
          companyName: recipient.companyName || jobDetails.companyName,
          jobTitle: recipient.jobTitle || jobDetails.jobTitle,
          messageId: info.messageId,
        });
      } catch (err) {
        console.error(`${itemNum} ❌ Failed to send to ${recipient.name} (${recipient.email}): ${err.message}`);
        stats.failed++;
      }
    }

    // Delay between individual emails
    if (i < recipients.length - 1) {
      await delay(dryRun ? 50 : delayMs);

      // Batch Delay Check
      if ((i + 1) % batchSize === 0) {
        if (!dryRun) {
          console.log(`\n⏳ Batch limit of ${batchSize} reached. Pausing for ${batchDelayMs / 1000 / 60} minutes to prevent rate limiting...`);
          await delay(batchDelayMs);
          console.log(`▶️  Resuming dispatch...\n`);
        } else {
          console.log(`\n⏳ [DRY-RUN] Reached batch milestone (${batchSize} recipients). Batch pause simulated.\n`);
        }
      }
    }
  }

  // Summary Report
  console.log("\n" + "=".repeat(65));
  console.log("📊 Campaign Execution Summary");
  console.log("=".repeat(65));
  console.log(`• Total Processed : ${stats.total}`);
  console.log(`• Successfully ${dryRun ? "Simulated" : "Sent"}: ${stats.sent}`);
  console.log(`• Skipped (Duplicates) : ${stats.skipped}`);
  console.log(`• Failed Errors        : ${stats.failed}`);
  console.log("=".repeat(65) + "\n");

  return stats;
}

module.exports = {
  sendCampaign,
};

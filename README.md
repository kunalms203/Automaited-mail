# 📧 Automated Mail Sender & Referral Outreach Engine

A production-grade, highly configurable automated email dispatch engine built for software engineers, developers, and professionals. Designed to automate cold job applications, employee referral requests, and recruiter outreach with personalized templates, resume attachments, anti-spam rate limiting, duplicate prevention, and dual authentication (**Gmail App Password** & **Google OAuth2**).

---

## 📑 Table of Contents

- [Overview & Architecture](#-overview--architecture)
- [Key Features](#-key-features)
- [Folder Structure](#-folder-structure)
- [Authentication Setup](#-authentication-setup)
  - [Method 1: Gmail App Password (Recommended)](#method-1-gmail-app-password-recommended)
  - [Method 2: Google Cloud OAuth2 (Advanced)](#method-2-google-cloud-oauth2-advanced)
- [Environment Configuration](#-environment-configuration)
- [Quick Start](#-quick-start)
- [CLI Usage & Command Reference](#-cli-usage--command-reference)
- [Recipient Data Management (CSV & JSON)](#-recipient-data-management-csv--json)
- [Email Templates & Customization](#-email-templates--customization)
- [Rate Limiting & Anti-Spam Safety](#-rate-limiting--anti-spam-safety)
- [Sent History & Deduplication](#-sent-history--deduplication)
- [Deliverability Best Practices](#-deliverability-best-practices)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)
- [License](#-license)

---

## 🏗 Overview & Architecture

```mermaid
flowchart TD
    A[Start CLI / Script] --> B[Load Config & .env]
    B --> C[Verify Resume Attachment]
    C --> D[Ingest & Validate Recipients<br/>CSV / JSON / Array]
    D --> E{Dry-Run Mode?}
    
    E -- Yes --> F[Compile Template & Subject]
    F --> G[Log Simulation Preview]
    G --> H[Check Batch Limit]
    
    E -- No --> I[Initialize Transporter<br/>App Password or OAuth2]
    I --> J{Already Contacted in History?}
    J -- Yes & no --force --> K[Skip Recipient]
    J -- No --> L[Render HTML + Plain-Text]
    L --> M[Send via Nodemailer]
    M --> N[Record Sent to sent-history.json]
    N --> O[Wait Per-Email Delay]
    O --> H
    
    H -- Batch Reached --> P[Pause Batch Delay 5m]
    H -- More Recipients --> D
    P --> D
    
    H -- Complete --> Q[Print Execution Summary]
```

---

## ✨ Key Features

- **🛡️ Dry-Run Simulation Mode (`--dry-run`)**: Test candidate details, recipient parsing, template interpolation, and subject lines without sending actual emails.
- **🔐 Dual Authentication Support**:
  - **SMTP via Gmail App Password**: Fast 2-minute setup, ideal for personal campaigns.
  - **Google OAuth2**: Token-refresh authentication using Google Cloud OAuth 2.0 client credentials.
- **📄 Clean Modular Templates**:
  - `job-application.html`: Tailored for direct job applications to hiring teams.
  - `referral-request.html`: Formatted for requesting employee referrals (includes Job ID, Job Title, and Workday/Careers link).
  - `cold-outreach.html`: Crafted for networking with engineering managers and founders.
- **📥 Dual-Payload Delivery (HTML + Plain-Text)**: Automatically compiles clean plain-text alternatives alongside styled HTML to maximize inbox placement and bypass spam filters.
- **📊 Recipient Ingestion (CSV, JSON, JS Array)**: Easily import contacts exported from LinkedIn, Apollo, or company career boards. Automatically strips whitespace, skips duplicates, and validates RFC email syntax.
- **⏱️ Smart Throttling & Batch Pauses**:
  - Configurable delay between individual emails (default: `2000ms`).
  - Batch pausing after every *N* emails (default: 20 emails, 5-minute pause) to stay well within Gmail sending limits.
- **🗂️ Deduplication & Sent History Tracker**: Logs successfully dispatched emails in `logs/sent-history.json` to prevent accidentally re-emailing the same contact if a campaign is re-run.
- **📎 Upfront Attachment Verification**: Verifies that your resume exists, is non-empty, and readable before sending, avoiding broken attachment emails.

---

## 📁 Folder Structure

```
Automaited-mail/
├── attachments/                       # Resumes and portfolio PDFs
│   ├── Kunal_Shinde_Resume.pdf
│   └── Kunal_Shinde_Resume2.pdf
├── data/                              # Contact lists (CSV & JSON)
│   ├── recipients.sample.csv          # Sample CSV contact sheet
│   ├── recipients.sample.json         # Sample JSON contact list
│   ├── kaplan-referrals.json          # Contacts for Kaplan referral campaign
│   └── ey-referrals.json              # Contacts for EY referral campaign
├── logs/                              # Sent logs and deduplication records
│   └── sent-history.json              # History of dispatched emails (git-ignored)
├── templates/                         # Customizable email HTML templates
│   ├── job-application.html           # Direct job application template
│   ├── referral-request.html          # Internal employee referral template
│   └── cold-outreach.html             # Cold outreach / networking template
├── src/                               # Core engine modules
│   ├── config.js                      # Config loader & candidate profile defaults
│   ├── mailer.js                      # Transporter factory (App Password & OAuth2)
│   ├── recipientLoader.js             # CSV & JSON parser and validator
│   ├── sender.js                      # Core dispatcher, rate limiter & batch manager
│   ├── templateEngine.js              # Template renderer & text extractor
│   ├── tracker.js                     # History deduplication tracker
│   └── validator.js                   # Email syntax & attachment validator
├── .env.example                       # Environment variables template
├── .gitignore                         # Git exclusion rules
├── bun.lock                           # Lockfile (Bun runtime)
├── package.json                       # Project scripts and dependencies
├── index.js                           # Primary CLI & job application runner
├── refferals.js                       # Kaplan referral runner
└── refferal2.js                       # EY OAuth2 referral runner
```

---

## 🔐 Authentication Setup

### Method 1: Gmail App Password (Recommended)

This is the simplest and most reliable method for personal Gmail accounts.

1. Go to your **Google Account**: [https://myaccount.google.com/](https://myaccount.google.com/)
2. Open the **Security** tab on the left.
3. Ensure **2-Step Verification** is turned **ON**.
4. Search for or navigate to **App Passwords**: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
5. Enter an app name (e.g., `Job Mailer`) and click **Create**.
6. Google will generate a **16-character password** (e.g., `abcd efgh ijkl mnop`).
7. Copy this password into your `.env` file under `password=`.

---

### Method 2: Google Cloud OAuth2 (Advanced)

If you prefer OAuth2 authentication:

1. Open [Google Cloud Console](https://console.cloud.google.com/) and create a new project.
2. Navigate to **APIs & Services** > **Library**, search for **Gmail API**, and click **Enable**.
3. Go to **APIs & Services** > **OAuth consent screen**:
   - User Type: **External**.
   - Fill in app name and your developer email.
   - Add your Gmail address as a **Test User**.
4. Go to **APIs & Services** > **Credentials**:
   - Click **Create Credentials** > **OAuth client ID**.
   - Application Type: **Web application**.
   - Authorized redirect URIs: `https://developers.google.com/oauthplayground`
   - Copy the generated `Client ID` and `Client Secret`.
5. Generate the Refresh Token on [OAuth 2.0 Playground](https://developers.google.com/oauthplayground):
   - Click the gear icon (top right) ⚙️ and check **Use your own OAuth credentials**.
   - Enter your `Client ID` and `Client Secret`.
   - In Step 1, select or input the scope: `https://mail.google.com/`.
   - Click **Authorize APIs** and sign into your Google account.
   - In Step 2, click **Exchange authorization code for tokens**.
   - Copy the resulting **Refresh Token**.
6. Paste the credentials into your `.env` file under `CLIENT_ID`, `CLIENT_SECRET`, and `REFRESH_TOKEN`.

---

## ⚙️ Environment Configuration

Create a `.env` file in the project root based on [.env.example](file:///.env.example):

```bash
cp .env.example .env
```

Fill in your profile and authentication details:

```env
# ==========================================
# Candidate Information (Used in email signatures)
# ==========================================
CANDIDATE_NAME="Kunal Shinde"
CANDIDATE_EMAIL="kunalms203@gmail.com"
CANDIDATE_PHONE="+91 9527928965"
CANDIDATE_LINKEDIN="https://linkedin.com/in/kunal-shinde2003"
CANDIDATE_GITHUB="https://github.com/kunalms203"

# ==========================================
# Method A: Gmail App Password
# ==========================================
mail="kunalms203@gmail.com"
password="your_16_character_app_password"

# ==========================================
# Method B: OAuth2 (Optional)
# ==========================================
MAIL2="kunalms2103@gmail.com"
CLIENT_ID="your_client_id.apps.googleusercontent.com"
CLIENT_SECRET="your_client_secret"
REFRESH_TOKEN="your_refresh_token"

# ==========================================
# Rate Limits & Delays
# ==========================================
DELAY_MS=2000              # 2 seconds between emails
BATCH_SIZE=20              # Pause after 20 emails
BATCH_DELAY_MS=300000      # 5 minute pause (300,000 ms)
```

---

## 🚀 Quick Start

Ensure dependencies are installed:

```bash
# Using Bun (preferred in this repository)
bun install

# Or using Node / npm
npm install
```

### 1. Test in Dry-Run Mode First

Always run a dry run before sending actual emails to preview rendered content:

```bash
bun run index.js --dry-run
```

### 2. Send Application Campaign

```bash
bun run index.js
# or: npm start
```

### 3. Send Referral Campaigns

```bash
# Kaplan Referral campaign (App Password mode)
bun run refferals.js --dry-run   # Preview
bun run refferals.js             # Live dispatch

# EY Referral campaign (OAuth2 mode)
bun run refferal2.js --dry-run  # Preview
bun run refferal2.js            # Live dispatch
```

---

## 💻 CLI Usage & Command Reference

The primary runner [index.js](file:///index.js) includes a versatile CLI interface:

```bash
node index.js [options]
# Or with bun:
bun run index.js [options]
```

### Options Table

| Flag | Argument | Description | Default |
| :--- | :--- | :--- | :--- |
| `--dry-run` | None | Simulates execution without sending real emails | `false` |
| `--force` | None | Bypasses deduplication (resends to contacts in history) | `false` |
| `--file` | `<path>` | Path to a custom `.csv` or `.json` contacts file | Built-in list |
| `--campaign` | `<type>` | Template type: `application`, `referral`, or `outreach` | `application` |
| `--company` | `<name>` | Company name to populate in template | `Stackfusion Private Limited` |
| `--role` | `<title>` | Job position to populate in template | `Junior Full Stack Developer (Pune)` |
| `--resume` | `<path>` | Custom PDF resume file path | `attachments/Kunal_Shinde_Resume.pdf` |
| `--auth` | `<type>` | Authentication type: `auto`, `app_password`, `oauth2` | `auto` |
| `--delay` | `<ms>` | Delay between individual emails in milliseconds | `2000` |
| `--batch` | `<size>` | Maximum emails before triggering a batch pause | `20` |
| `--help`, `-h` | None | Displays help information and examples | - |

### Real-World Examples

#### Example 1: Preview a CSV list with a Referral Template
```bash
bun run index.js --dry-run --campaign referral --file data/recipients.sample.csv
```

#### Example 2: Run a Cold Outreach Campaign to Startup Founders
```bash
bun run index.js --campaign outreach --file data/founders.csv --company "Acme Labs"
```

#### Example 3: Send Applications with Custom Resume and 3-second Delay
```bash
bun run index.js --file data/companies.json --resume attachments/Kunal_Shinde_Resume2.pdf --delay 3000
```

---

## 👥 Recipient Data Management (CSV & JSON)

You can maintain contacts in either CSV or JSON files.

### 1. CSV Format (`.csv`)

Create or export a spreadsheet saved as CSV with headers:

```csv
name,email,companyName,jobTitle,jobId,jobLink,jobLocation
"John Doe",john.doe@example.com,"TechCorp","Full Stack Developer","REQ-10492","https://example.com/careers/job10492","Pune, India"
"Jane Smith",jane.smith@example.com,"Innovate Inc","Associate Software Engineer","JR-8821","https://example.com/careers/job8821","Bangalore, India"
```

*Supported column aliases*:
- `name`
- `email`
- `company` or `companyName`
- `role`, `title`, or `jobTitle`
- `job_id`, `jobid`, or `jobId`
- `link`, `job_link`, or `jobLink`
- `location` or `jobLocation`

### 2. JSON Format (`.json`)

```json
[
  {
    "name": "Sarah Connor",
    "email": "sarah.connor@example.com",
    "companyName": "Cyberdyne Systems",
    "jobTitle": "Full Stack Engineer",
    "jobId": "CS-2026-9",
    "jobLink": "https://example.com/careers/cs-2026",
    "jobLocation": "Pune, India"
  }
]
```

---

## ✉️ Email Templates & Customization

Templates are stored in the [templates/](file:///templates/) directory. Each template supports HTML formatting and dynamic placeholders.

### Available Placeholders

| Tag | Replaced With |
| :--- | :--- |
| `{{name}}` | Recipient's name (e.g. `Arzoo` or `Hiring Manager`) |
| `{{companyName}}` | Target company name |
| `{{jobTitle}}` | Target position title |
| `{{jobId}}` | Job requisition ID (e.g. `JR248715`) |
| `{{jobLink}}` | Application URL |
| `{{jobLocation}}` | Office or remote location |
| `{{candidateName}}` | Your name (from config / `.env`) |
| `{{candidateEmail}}` | Your email |
| `{{candidatePhone}}` | Your phone number |
| `{{candidateLinkedIn}}` | Your LinkedIn profile link |
| `{{candidateGitHub}}` | Your GitHub profile link |
| `{{languages}}` | Languages list (HTML, JavaScript, Python, Java) |
| `{{frontend}}` | Frontend skills (React, Redux, Tailwind) |
| `{{backend}}` | Backend skills (Node.js, Express) |
| `{{databases}}` | Database skills (MySQL, MongoDB, PostgreSQL) |

### Conditional Blocks

You can wrap optional fields in `{{#if key}} ... {{/if}}`. For example:

```html
{{#if jobId}}
  • <strong>Job ID:</strong> {{jobId}}<br>
{{/if}}
```

If `jobId` is missing for a contact, the line will be omitted cleanly without leaving blank text.

---

## ⏱️ Rate Limiting & Anti-Spam Safety

To protect your Gmail sender reputation and prevent Google from temporarily suspending your account, the engine implements two-tiered rate limiting:

1. **Inter-Email Delay (`DELAY_MS`)**:
   - Default: `2000ms` (2 seconds).
   - Simulates human dispatch and prevents SMTP socket flooding.
2. **Batch Pausing (`BATCH_SIZE` & `BATCH_DELAY_MS`)**:
   - Default: Every **20 emails**, the engine pauses for **5 minutes** (300,000 ms).
   - Gives your sending IP and Gmail account a cooldown period.

---

## 🗂️ Sent History & Deduplication

When an email is successfully sent, its metadata is recorded in [logs/sent-history.json](file:///logs/sent-history.json):

```json
[
  {
    "email": "reena.sinhapr@kaplan.edu",
    "name": "Reena Sinha",
    "campaignId": "Kaplan_JR248715",
    "companyName": "Kaplan",
    "jobTitle": "Associate Software Engineer",
    "messageId": "<01a34b...>",
    "timestamp": "2026-09-26T04:15:00.000Z"
  }
]
```

- If you re-run the campaign, contacts already present in the history will be **safely skipped** (`⏭️ Skipped ... Already contacted`).
- To override this and force resending, pass the `--force` flag.

---

## 🛡️ Deliverability Best Practices

1. **Daily Volume Limits**:
   - Personal `@gmail.com` accounts have a hard ceiling of **500 emails / 24 hours**.
   - Recommended daily limit for cold job outreach: **50 to 100 emails/day** to keep spam rates near 0%.
2. **Personalized Greetings**:
   - Always include the recruiter or employee's first name (`name` field) rather than generic greetings.
3. **Avoid Spam Trigger Words**:
   - Keep subject lines focused on the specific role, job ID, and candidate name.
4. **Optimal Dispatch Times**:
   - Send emails during working hours in the recipient's local time zone (Tuesday through Thursday between 9:00 AM and 11:30 AM typically achieves highest open rates).
5. **Clean Attachment Size**:
   - Keep PDF resumes under **2 MB** (the default resumes here are lightweight ~100 KB).

---

## ❓ Troubleshooting & FAQs

### 1. `Invalid login: 535-5.7.8 Username and Password not accepted`
- **Cause**: Using your primary Google login password instead of a Gmail App Password, or 2-Step Verification is disabled.
- **Fix**: Visit [Google App Passwords](https://myaccount.google.com/apppasswords), generate a 16-character App Password, and put it in `.env` under `password=`.

### 2. `Attachment not found at: ...`
- **Cause**: The resume file path does not exist or the filename was mistyped.
- **Fix**: Check `attachments/` folder and verify that the file exists and is readable.

### 3. `invalid_grant: Bad Request` (OAuth2 Mode)
- **Cause**: The OAuth2 refresh token has expired or was revoked.
- **Fix**: Revisit Google OAuth Playground, regenerate the authorization code, and copy the fresh `refresh_token` into `.env`.

### 4. How do I send only to one test email?
Use a temporary CSV or JSON file:
```bash
bun run index.js --file data/test.json
```
Where `data/test.json` has only your secondary email.

---

## 📄 License

This project is licensed under the [ISC License](file:///package.json). Feel free to adapt and customize it for your job search campaigns!

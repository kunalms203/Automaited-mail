const path = require("path");
require("dotenv").config();

module.exports = {
  // Candidate Profile Information
  candidate: {
    name: process.env.CANDIDATE_NAME || "Kunal Shinde",
    email:
      process.env.CANDIDATE_EMAIL ||
      process.env.EMAIL_USER ||
      process.env.mail ||
      "kunalms203@gmail.com",
    phone: process.env.CANDIDATE_PHONE || "+91 9527928965",
    linkedin:
      process.env.CANDIDATE_LINKEDIN ||
      "https://linkedin.com/in/kunal-shinde2003",
    github:
      process.env.CANDIDATE_GITHUB || "https://github.com/kunalms203",
    education:
      "B.E. in Artificial Intelligence & Machine Learning from Sahyadri Valley College of Engineering, Pune",
    experience:
      "Full Stack Development Internship at Logion Solutions (MERN stack, RESTful APIs, Admin Dashboards)",
    skills: {
      languages: "HTML, CSS, JavaScript, Python, Java",
      frontend: "React.js, Redux, Tailwind CSS, Bootstrap",
      backend: "Node.js, Express",
      databases: "MySQL, MongoDB, PostgreSQL",
      tools: "Git, GitHub, Docker, Postman",
    },
  },

  // Auth Credentials
  auth: {
    // App Password (SMTP)
    appPassword: {
      user: process.env.EMAIL_USER || process.env.mail,
      pass: process.env.EMAIL_PASS || process.env.password,
    },
    // OAuth2 Credentials
    oauth2: {
      user:
        process.env.OAUTH_USER ||
        process.env.MAIL2 ||
        process.env.EMAIL_USER ||
        process.env.mail,
      clientId: process.env.CLIENT_ID || process.env.OAUTH_CLIENT_ID,
      clientSecret:
        process.env.CLIENT_SECRET || process.env.OAUTH_CLIENT_SECRET,
      refreshToken:
        process.env.REFRESH_TOKEN || process.env.OAUTH_REFRESH_TOKEN,
      redirectUri:
        process.env.REDIRECT_URI ||
        "https://developers.google.com/oauthplayground",
    },
  },

  // Sending Rates & Throttling
  limits: {
    defaultDelayMs: parseInt(process.env.DELAY_MS || "2000", 10), // 2s between emails
    defaultBatchSize: parseInt(process.env.BATCH_SIZE || "20", 10), // 20 emails per batch
    defaultBatchDelayMs: parseInt(
      process.env.BATCH_DELAY_MS || String(5 * 60 * 1000), // 5 min delay between batches
      10
    ),
  },

  // File Paths
  paths: {
    rootDir: path.resolve(__dirname, ".."),
    attachmentsDir: path.resolve(__dirname, "..", "attachments"),
    defaultResume: path.resolve(
      __dirname,
      "..",
      "attachments",
      "Kunal_Shinde_Resume.pdf"
    ),
    logsDir: path.resolve(__dirname, "..", "logs"),
    sentHistory: path.resolve(__dirname, "..", "logs", "sent-history.json"),
  },
};

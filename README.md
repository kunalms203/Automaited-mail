
# 📧 Automated Email Sender with Nodemailer

This Node.js script uses **Nodemailer** to send personalized emails (with attachments) to multiple recipients. Each email contains a custom greeting and message, and includes a resume file as an attachment.

---

## 🚀 Features

- Sends emails to multiple recipients
- Personalized greeting (e.g., `Dear Harshita Tripathi`)
- Attaches a resume file (PDF)
- Delay between each email to avoid spam filters
- Uses environment variables for secure credential handling

---

## 📁 Folder Structure

```
project-root/
│
├── attachments/
│   └── Kunal_Shinde_Resume.pdf
│
├── .env
├── index.js
└── README.md
```

---

## 🔐 Environment Setup

Create a `.env` file in the root:

```env
mail=your_email@gmail.com
password=your_16_character_app_password
```

> 💡 Use a **Gmail App Password**, not your Gmail login password.  
> Set up App Password here: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

---

## 📦 Installation

```bash
npm install nodemailer dotenv
```

---

## 🛠 Usage

```bash
node index.js
```

Emails will be sent with a 2-second delay between each to avoid rate limits.

---

## ✉️ Sample Email Output

- Subject: `Application for Full Stack Engineer(Pune) - Kunal Shinde`
- Body: Custom content with candidate's profile
- Attachment: `Kunal_Shinde_Resume.pdf`

---

## ✅ To Customize

- Modify `recipients` array in `index.js` to target different users
- Update email body or job title/company
- Use CSV/Excel for bulk dynamic input (optional)

---

## 📬 Example Output

```bash
Email sent to Harshita Tripathi (harshitatripathimds@gmail.com): <message-id>
Email sent to Ashfak Is (ashfakis@yahoo.com): <message-id>
```

---

## 📄 License

MIT — free to use and modify.

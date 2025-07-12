const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();

// Email list
const recipients = [
  { name: "Sayali", email: "sayali@ioweb3.io" },
  { name: "Sayali", email: "sayali.sarvade94@gmail.com" },
  { name: "Rupali", email: "rupali@ioweb3.io" },
  { name: "Rupali", email: "rupalimagar7777@gmail.com" },
  { name: "Nikhil", email: "deshmukhniks1998@gmail.com" },
  { name: "Sushma", email: "sushma@ioweb3.io" },
  { name: "Sushma", email: "patilsushma087@gmail.com" },
  { name: "Shraddha", email: "shraddha@ioweb3.io" },
  { name: "Shraddha", email: "khandreshraddha19@gmail.com" },
  { name: "Prajakta", email: "prajakta@ioweb3.io" },
  { name: "Prajakta", email: "prajaktashinde6102@gmail.com" },
  { name: "Akash", email: "akash@ioweb3.io" },
  { name: "Akash", email: "akashrajmane93@gmail.com" },
  { name: "Swapnil", email: "swapnil@ioweb3.io" },
  { name: "Swapnil", email: "swapnilnrl99@gmail.com" },
  { name: "Hiring Manager", email: "info@technoartz.com" },
  { name: "Sandip", email: "sandipkgadekar@gmail.com" },
];




// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.mail,
    pass: process.env.password,
  },
});

// File to attach
const attachmentPath = path.join(__dirname, "attachments" ,"Kunal_Shinde_Resume.pdf");

// Delay helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Send emails with delay
const sendEmails = async () => {
  for (const { name, email } of recipients) {
    const jobTitle = "Full Stack Developer - Javascript Framework";
    const companyName = "IOWeb3 Technologies";

    const mailOptions = {
      from: '"Kunal Shinde" <kunalms203@gmail.com>',
      to: email,
      subject: `Application for ${jobTitle} - Kunal Shinde`,
      html: `
              <p>Dear ${name},</p>

              <p>I hope this message finds you well.</p>

              <p>I am writing to express my interest in the <b>${jobTitle}</b> position at <b>${companyName}</b>. As a recent B.E. graduate in Artificial Intelligence & Machine Learning from Sahyadri Valley College of Engineering, I bring both academic knowledge and practical experience in full stack development, making me well-suited for roles in software engineering and frontend/backend development.</p>

              <p>During my internship at Logion Solutions, I developed and deployed MERN stack applications, optimized API performance, and built admin dashboards that streamlined product workflows. I’ve also led and contributed to various projects including an AI-integrated real-time chat app, a property rental platform, and an online code editor—each demonstrating my technical skills and ability to solve real-world problems efficiently.</p>

              <p><b>Technical Highlights:</b></p>
              <ul>
                <li><b>Languages:</b> HTML, CSS, JavaScript, Python, Java</li>
                <li><b>Frontend:</b> React.js, Redux, Tailwind CSS, Bootstrap</li>
                <li><b>Backend:</b> Node.js, Express</li>
                <li><b>Databases:</b> MySQL, MongoDB, PostgreSQL</li>
                <li><b>Other Tools:</b> Git, GitHub</li>
              </ul>

              <p>I am passionate about creating impactful software solutions and continuously improving user experience and system performance. I am excited about the opportunity to apply my skills and grow further within your team.</p>

              <p>Please find my resume attached for your review. I would be grateful for the opportunity to discuss how I can contribute to your organization.</p>

              <p>Thank you for your time and consideration.</p>

              <p>Best regards,<br/>
              Kunal Shinde<br/>
              Email: kunalms203@gmail.com<br/>
              Phone: +91 9527928965<br/>
              LinkedIn: <a href="https://linkedin.com/in/kunal-shinde2003">linkedin.com/in/kunal-shinde2003</a><br/>
              GitHub: <a href="https://github.com/kunalms203">github.com/kunalms203</a>
              </p>`, // From above
      attachments: [
        {
          filename: "Kunal_Shinde_Resume.pdf",
          path: attachmentPath,
        },
      ],
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${name} (${email}): ${info.messageId}`);
    } catch (err) {
      console.error(`Failed to send to ${name} (${email}):`, err.message);
    }

    // Wait 2 seconds before sending the next email
    await delay(2000);
  }
};

sendEmails();

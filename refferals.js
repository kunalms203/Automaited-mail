const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();

// Email list
const recipients = [
  { name: "Mridula", email: "mridula.vasu@cscglobal.com" },
  { name: "Mridulla", email: "mridulla.91@gmail.com" },
  { name: "Prachi", email: "prachi.pandey@cscglobal.com" },
  { name: "Prachi", email: "prachi1984@gmail.com" },
  { name: "Manisha", email: "s-manisha@musgravegroup.com" },
  { name: "Manisha", email: "manisharma.1511@gmail.com" },
  { name: "Moni", email: "moni.borah@cscglobal.com" },
  { name: "Hanna", email: "hanna.ponnu@cscglobal.com" },
  { name: "Hanna", email: "hannaofficial97@gmail.com" },
  { name: "Aarti", email: "aarti.paruleker@intertrustgroup.com" },
  { name: "Aarti", email: "paruleker.aarti15@gmail.com" },
  { name: "Sindhu", email: "sindhu.r@cscglobal.com" },
  { name: "Sindhu", email: "sindhu91.r@gmail.com" },
  { name: "Vasundhara", email: "vasundhara.shukla@cscglobal.com" },
  { name: "Nikki", email: "nikkishukla7@gmail.com" },
  { name: "Rachel", email: "rachel.ramesh@cscglobal.com" },
  { name: "Rachel", email: "rachel.raaga@gmail.com" },
  { name: "Shivakumar", email: "g.shivakumar4216@gmail.com" },
  { name: "Vineet", email: "vineet.pandey@cscglobal.com" },
  { name: "Vineet", email: "vineet.panday650@gmail.com" },
  { name: "Vikas", email: "vikaschandra0102@gmail.com" },
  { name: "Luis", email: "luis.chagas@cscglobal.com" },
  { name: "Luis", email: "contato@luischagas.dev" },
  { name: "Rajan", email: "rajan.arjun@gmail.com" },
  { name: "Kang", email: "kang.guo@cscglobal.com" },
  { name: "Guo", email: "guokang@hotmail.com" },
  { name: "Mohan", email: "mohan.babu@cscglobal.com" },
  { name: "Mohan", email: "mohanbabum02@gmail.com" },
  { name: "Usman", email: "usman.naqvi@cscglobal.com" },
  { name: "Usman", email: "usman_naqvi89@hotmail.com" },
  { name: "Sharsh", email: "sharsh0702@gmail.com" },
  { name: "Harish", email: "harishhosmat@gmail.com" }
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
const attachmentPath = path.join(__dirname, "attachments", "Kunal_Shinde_Resume.pdf");

// Delay helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Send emails with delay
const sendEmails = async () => {
  for (const { name, email } of recipients) {
    const jobTitle = "Associate Software Engineer";
    const jobLocation = "Bangalore, India";
    const jobId = "12068";
    const jobLink = "https://hczw.fa.us2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1001/job/12068";
    const companyName = "CSC";

    const mailOptions = {
      from: '"Kunal Shinde" <kunalms203@gmail.com>',
      to: email,
      subject: `Referral Request for ${jobTitle} (${jobLocation}) - Kunal Shinde`,
      html: `
        <p>Dear ${name},</p>

        <p>I hope you're doing well!</p>

        <p>I am reaching out to kindly request a referral for the position of <b>${jobTitle}</b> at <b>${companyName}</b>, located in <b>${jobLocation}</b> (Job ID: <b>${jobId}</b>). I came across this opportunity through your organization and am highly enthusiastic about applying for it. You can find more details here: <a href="${jobLink}">${jobLink}</a>.</p>

        <p>As a recent B.E. graduate in Artificial Intelligence & Machine Learning from Sahyadri Valley College of Engineering, Pune, and with hands-on full stack experience during my internship at Logion Solutions, I am confident I can contribute meaningfully to your team.</p>

        <p><b>Quick Snapshot of My Background:</b></p>
        <ul>
          <li><b>Languages:</b> HTML, CSS, JavaScript, Python, Java</li>
          <li><b>Frontend:</b> React.js, Redux, Tailwind CSS, Bootstrap</li>
          <li><b>Backend:</b> Node.js, Express</li>
          <li><b>Databases:</b> MySQL, MongoDB, PostgreSQL</li>
        </ul>

        <p>I’ve attached my resume for your reference. If you find my profile suitable, I would truly appreciate your support in referring me for this role.</p>

        <p>Thank you in advance for your time and assistance.</p>

        <p>Warm regards,<br/>
        Kunal Shinde<br/>
        Email: kunalms203@gmail.com<br/>
        Phone: +91 9527928965<br/>
        LinkedIn: <a href="https://linkedin.com/in/kunal-shinde2003">linkedin.com/in/kunal-shinde2003</a><br/>
        GitHub: <a href="https://github.com/kunalms203">github.com/kunalms203</a>
        </p>
      `,
      attachments: [
        {
          filename: "Kunal_Shinde_Resume.pdf",
          path: attachmentPath,
        },
      ],
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Referral email sent to ${name} (${email}): ${info.messageId}`);
    } catch (err) {
      console.error(`Failed to send to ${name} (${email}):`, err.message);
    }

    await delay(2000); // 2s delay
  }
};

sendEmails();

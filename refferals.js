const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();

// Email list
const recipients = [
  { name: "Reena Sinha", email: "reena.sinhapr@kaplan.edu" },
  { name: "Kavya N", email: "kavya.n@kaplan.com" },
  { name: "Nithin Jadhav", email: "nithin.jadhav@kaplan.com" },
  { name: "Ruchi Sinha", email: "ruchi.sinha@kaplan.com" },
  { name: "Vinitha M", email: "vinitha.m@kaplan.com" },
  { name: "Neha Agarwal", email: "neha.agarwal@kaplan.com" },
  { name: "Swarna Mekhla", email: "swarna.mekhla@kaplan.com" },
  { name: "Anchal Vaish", email: "anchal.vaish@kaplan.com" },
  { name: "Keerthana Bhat", email: "keerthana.bhat@kaplan.com" },
  { name: "Naveed", email: "naveed@kaplan.com" },
  { name: "Shakil Khan", email: "shakil.khan@kaplan.com" },
  { name: "Sireesha Vysyaraju", email: "sireesha.vysyaraju@kaplan.com" },
  { name: "Quyen Ho", email: "quyen.ho@kaplan.com" },
  { name: "Abhishek Ramaswamy", email: "abhishek.ramaswamy@kaplan.com" },
  { name: "Brian Lingen", email: "brian.lingen@kaplan.com" },
  { name: "Chad Marino", email: "chad.marino@kaplan.com" },
  { name: "Ernie Castruita", email: "ernie.castruita@kaplan.com" },
  { name: "Dan Corley", email: "dan.corley@kaplan.com" },
  { name: "Jon Heinert", email: "jon.heinert@kaplan.com" },
  { name: "Kelly Pyatt", email: "kelly.pyatt@kaplan.com" },
  { name: "Nina Deng", email: "nina.deng@kaplan.com" },
  { name: "Ozerk Gogus", email: "ozerk.gogus@kaplan.com" },
  { name: "Leon Gersing", email: "leon.gersing@kaplan.com" },
  { name: "Kyt Gonzales", email: "kyt.gonzales@kaplan.com" },
  { name: "Matthew Morey", email: "matthew.morey@kaplan.com" },
  { name: "Kristy Whitcomb", email: "kristy.whitcomb@kaplan.com" },
  { name: "Dylan Banter", email: "dylan.banter@kaplan.com" },
  { name: "Caroline Fairhurst", email: "caroline.fairhurst@kaplan.com" },
  { name: "Kristi Haney", email: "kristi.haney@kaplan.com" },
  { name: "Eddie Jackson", email: "eddie.jackson@kaplan.com" },
  { name: "Lyon", email: "lyon@kaplan.com" },
  { name: "Nyphen Sanders", email: "nyphen.sanders@kaplan.com" },
  { name: "Kaplan Inc", email: "kaplan.inc@kaplan.com" },
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
    const jobTitle = "Associate Software Engineer (Internship Program to Full-time Employee)";
    const jobLocation = "Bangalore, KA, India";
    const jobId = "JR248715";
    const jobLink = "https://ghc.wd1.myworkdayjobs.com/en-US/Kaplan_Careers/job/Associate-Software-Engineer--Internship-Program-to-Full-time-Employee-_JR248715-1";
    const companyName = "Kaplan";

    const mailOptions = {
      from: '"Kunal Shinde" <kunalms203@gmail.com>',
      to: email,
      subject: `Referral Request for ${jobTitle} (${jobId}) - Kunal Shinde`,
      html: `
        <p>Dear ${name},</p>

        <p>I hope you're doing well!</p>

        <p>I am reaching out to kindly request a referral for the position of <b>${jobTitle} (Job id - JR248715)</b> at <b>${companyName}</b>, located in <b>${jobLocation}</b>. I came across this opportunity through your organization and am highly enthusiastic about applying for it. You can find more details here: <a href="${jobLink}">${jobLink}</a>.</p>

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

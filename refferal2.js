const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

// ---------------------------------
// OAuth2 Client Setup
// ---------------------------------
const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
});

// creates transport when required
async function createTransporter() {
    const accessTokenObject = await oauth2Client.getAccessToken();
    const accessToken = accessTokenObject.token;

    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: process.env.MAIL2,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
            accessToken,
        },
    });
}

// ---------------------------------
// Email list
// ---------------------------------
const recipients = [
  { name: "Renuka Mhetre", email: "renuka.mhetre@in.ey.com" },
  { name: "Onkar Hake", email: "onkar.hake@in.ey.com" },
  { name: "Srishti Sahu", email: "srishti.sahu@in.ey.com" },
  { name: "Niloy Talukdar", email: "niloy.talukdar@in.ey.com" },
  { name: "Akash Muttha", email: "akash.muttha@in.ey.com" },
  { name: "Shagun Goyal", email: "shagun.goyal@in.ey.com" },
  { name: "Noorjahan Shaikh", email: "noorjahan.shaikh@in.ey.com" },
  { name: "Rohit Gupta", email: "rohit.gupta@in.ey.com" },
  { name: "Aakriti Sharma", email: "aakriti.sharma@in.ey.com" },
  { name: "Shreeya Chowdhury", email: "shreeya.chowdhury@in.ey.com" },
  { name: "Indranil Bose", email: "indranil.bose@in.ey.com" },
  { name: "Aman Pardeshi", email: "aman.pardeshi@in.ey.com" },
  { name: "Apurva Jaiswal", email: "apurva.jaiswal@in.ey.com" },
  { name: "Pavankumar Khaladkar", email: "pavankumar.khaladkar@in.ey.com" },
  { name: "Samarth Kathuria", email: "samarth.kathuria@in.ey.com" },
  { name: "Swati Shinde", email: "swati.shinde@in.ey.com" },
  { name: "Ayush Rai", email: "ayush.rai@in.ey.com" },
  { name: "Vishal Singh", email: "vishal.singh@in.ey.com" },
  { name: "Rohit Wahile", email: "rohit.wahile@in.ey.com" },
  { name: "Om Chavan", email: "om.chavan@in.ey.com" },
  { name: "Nagarjuna Yarradla", email: "nagarjuna.yarradla@in.ey.com" },
  { name: "Yogini Birajdar", email: "yogini.birajdar@in.ey.com" },
  { name: "Menka Bhapkar", email: "menka.bhapkar@in.ey.com" },
  { name: "Girish Gorde", email: "girish.gorde@vodafone.com" },
  { name: "Ishit Parekh", email: "ishit.parekh@in.ey.com" },
  { name: "Varsha Bhuvaneshwar", email: "varsha.bhuvaneshwar@in.ey.com" },
  { name: "Manisha Sharma", email: "manisha.sharma@in.ey.com" },
];

// ---------------------------------
const attachmentPath = path.join(__dirname, "attachments", "Kunal_Shinde_Resume2.pdf");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const BATCH_SIZE = 20;
const BATCH_DELAY = 5 * 60 * 1000; // 5 mins

const sendEmails = async () => {
    const transporter = await createTransporter();

    for (let i = 0; i < recipients.length; i++) {
        const { name, email } = recipients[i];

        const jobTitle =
            "DET - Associate Software Engineer - GDSN02";
        const jobLocation = "Bangalore, KA, India";
        const jobId = "1612041";
        const jobLink =
            "https://eyglobal.yello.co/jobs/0Iy0Oeg60FgeeOOcQQugBw";
        const companyName = "EY";

        const mailOptions = {
              from: '"Kunal Shinde" <kunalms2103@gmail.com>',
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
                Email: kunalms2103@gmail.com<br/>
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
            console.log(`Email sent to ${name} (${email}): ${info.messageId}`);
        } catch (err) {
            console.error(`Failed for ${name} (${email}): ${err.message}`);
        }

        // Delay between individual emails
        await delay(2000);

        // Delay between batches of 20
        if ((i + 1) % BATCH_SIZE === 0 && i !== recipients.length - 1) {
            console.log(`Waiting for 5 minutes before next batch...`);
            await delay(BATCH_DELAY);
        }
    }
};

sendEmails();

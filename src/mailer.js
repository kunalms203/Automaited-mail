const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const config = require("./config");

/**
 * Creates and verifies a Nodemailer transporter.
 * Supports Gmail App Password (SMTP) and Google OAuth2.
 *
 * @param {'auto' | 'app_password' | 'oauth2'} [preferredMode='auto']
 * @returns {Promise<{ transporter: any, authMode: string, senderEmail: string }>}
 */
async function createMailer(preferredMode = "auto") {
  const { appPassword, oauth2 } = config.auth;

  // Decide mode
  let mode = preferredMode;
  if (mode === "auto") {
    if (oauth2.clientId && oauth2.clientSecret && oauth2.refreshToken) {
      mode = "oauth2";
    } else if (appPassword.user && appPassword.pass) {
      mode = "app_password";
    } else {
      // Default to app_password so user sees clear error if missing credentials
      mode = "app_password";
    }
  }

  if (mode === "oauth2") {
    if (!oauth2.clientId || !oauth2.clientSecret || !oauth2.refreshToken) {
      throw new Error(
        "OAuth2 mode selected but missing credentials. Please provide CLIENT_ID, CLIENT_SECRET, and REFRESH_TOKEN in your .env file."
      );
    }

    const OAuth2Client = google.auth.OAuth2;
    const client = new OAuth2Client(
      oauth2.clientId,
      oauth2.clientSecret,
      oauth2.redirectUri
    );

    client.setCredentials({
      refresh_token: oauth2.refreshToken,
    });

    let accessToken;
    try {
      const tokenResponse = await client.getAccessToken();
      accessToken = tokenResponse.token;
      if (!accessToken) {
        throw new Error("Empty access token returned by OAuth2 client.");
      }
    } catch (err) {
      throw new Error(`Failed to retrieve OAuth2 access token: ${err.message}`);
    }

    const senderEmail = oauth2.user || config.candidate.email;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: senderEmail,
        clientId: oauth2.clientId,
        clientSecret: oauth2.clientSecret,
        refreshToken: oauth2.refreshToken,
        accessToken,
      },
    });

    return { transporter, authMode: "OAuth2", senderEmail };
  } else {
    // App Password SMTP mode
    if (!appPassword.user || !appPassword.pass) {
      throw new Error(
        "Gmail App Password mode selected but missing credentials. Please set 'mail' and 'password' (or 'EMAIL_USER' and 'EMAIL_PASS') in your .env file."
      );
    }

    const senderEmail = appPassword.user;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: appPassword.user,
        pass: appPassword.pass,
      },
    });

    return { transporter, authMode: "App Password (SMTP)", senderEmail };
  }
}

module.exports = {
  createMailer,
};

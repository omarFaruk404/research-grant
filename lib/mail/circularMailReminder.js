import nodemailer from "nodemailer";

// --- CONFIGURATION ---
const TRANSPORTER_CONFIG = {
  host: "mail.rpg.bu.ac.bd",
  port: 465,
  secure: true,
  auth: {
    user: "officer@rpg.bu.ac.bd",
    pass: process.env.SMTP_PASSWORD, 
  },
};

const SENDER_IDENTITY = `"RPG System Officer" <officer@rpg.bu.ac.bd>`;

// --- BASE SEND FUNCTION ---
const sendBaseEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport(TRANSPORTER_CONFIG);
    await transporter.sendMail({
      from: SENDER_IDENTITY,
      to,
      subject,
      html: htmlContent,
    });
    return { success: true };
  } catch (error) {
    console.error("❌ Email Error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Sends a circular reminder email.
 * @param {object[]} recipients - Array of { name, email }
 * @param {object} circular - { title, type, file_url, fiscal_year }
 * @param {string} circular.type - 'proposal', 'reminder', or 'notice'
 */
export const sendCircularReminder = async (recipients, circular) => {
  const loginUrl = "https://rpg.bu.ac.bd/login"; 
  let subject = "";
  let bodyContent = "";

  // 1. Determine Content based on Circular Type
  switch (circular.type) {
    case "proposal":
      subject = `Call for Research Proposals: ${circular.fiscal_year}`;
      bodyContent = `
        <p>This is to inform you that the <strong>Call for Research Proposals</strong> for the fiscal year <strong>${circular.fiscal_year}</strong> is now OPEN.</p>
        <div style="background-color: #e3f2fd; padding: 15px; border-left: 4px solid #0d6efd; margin: 20px 0;">
          <strong>${circular.title}</strong>
        </div>
        <p>Please log in to the portal to view the detailed guidelines and submit your proposal before the deadline.</p>
      `;
      break;

    case "reminder":
      subject = `Reminder: ${circular.title}`;
      bodyContent = `
        <p>This is a <strong>gentle reminder</strong> regarding the following circular.</p>
        <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <strong>${circular.title}</strong>
        </div>
        <p>Please ensure you have taken any necessary actions associated with this notice.</p>
      `;
      break;

    case "notice":
    default:
      subject = `New Notice: ${circular.title}`;
      bodyContent = `
        <p>A new circular has been posted on the Research Project Management System.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #6c757d; margin: 20px 0;">
          <strong>${circular.title}</strong>
        </div>
        <p>Please check your dashboard for further details.</p>
      `;
      break;
  }

  // 2. Loop and Send
  const emailPromises = recipients.map(async (user) => {
    if (!user.email) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; background-color: #f4f4f7; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #0d6efd; margin-top: 0; padding-bottom: 15px; border-bottom: 2px solid #eee;">Research Management Office</h2>
          <p>Dear <strong>${user.name}</strong>,</p>
          
          ${bodyContent}
          
          <div style="text-align: center; margin-top: 35px; margin-bottom: 20px;">
            <a href="${loginUrl}" style="background-color: #0d6efd; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Portal</a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="font-size: 12px; color: #888; text-align: center; margin: 0;">
            Barishal University Research Project Management System<br>
            <span style="font-size: 11px; color: #aaa;">This is an automated message. Please do not reply directly.</span>
          </p>
        </div>
      </body>
      </html>
    `;

    return sendBaseEmail(user.email, subject, html);
  });

  await Promise.all(emailPromises);
};
import nodemailer from "nodemailer";

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

// Helper: Standard Transport
const createTransporter = () => nodemailer.createTransport(TRANSPORTER_CONFIG);

// 1. Standard Work Reminder (Existing Logic)
export const sendWorkReminderEmail = async ({ to, name, type, project }) => {
  const transporter = createTransporter();
  const loginUrl = "https://rpg.bu.ac.bd/login"; 
  let subject = "";
  let bodyContent = "";

  switch (type) {
    case "SUBMIT_FINAL_REPORT":
      subject = `Reminder: Submit Final Report - ${project.title}`;
      bodyContent = `<p>Gentle reminder: The <strong>Final Report</strong> for your project is due.</p>`;
      break;
    case "UPDATE_FINAL_REPORT":
      subject = `Action Required: Update Final Report - ${project.title}`;
      bodyContent = `<p>Please update your final report based on recent feedback.</p>`;
      break;
    case "FINISH_REVIEW":
      subject = `Pending Review Reminder: ${project.title}`;
      bodyContent = `<p>You have a pending review assignment waiting for completion.</p>`;
      break;
    default: return { success: false, error: "Invalid Type" };
  }

  const html = `
    <div style="font-family: Arial; padding: 20px; color: #333;">
      <h3 style="color: #0d6efd;">Project Management System</h3>
      <p>Dear <strong>${name}</strong>,</p>
      ${bodyContent}
      <div style="background: #f8f9fa; padding: 10px; margin: 15px 0; border-left: 3px solid #0d6efd;">
        <strong>Project:</strong> ${project.title}
      </div>
      <p><a href="${loginUrl}">Log in to Dashboard</a></p>
    </div>
  `;

  try {
    await transporter.sendMail({ from: SENDER_IDENTITY, to, subject, html });
    return { success: true };
  } catch (error) {
    console.error("Email Error:", error);
    return { success: false, error: error.message };
  }
};

// 2. ✅ NEW: Custom Email with Attachment (Buffer)
export const sendCustomEmail = async ({ to, subject, body, attachment }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: SENDER_IDENTITY,
    to, // Can be comma-separated string
    subject,
    html: `<div style="font-family: Arial; padding: 20px;">${body}</div>`,
    attachments: []
  };

  // Handle Attachment Buffer
  if (attachment) {
    mailOptions.attachments.push({
      filename: attachment.filename,
      content: attachment.content, // Buffer
    });
  }

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Custom Mail Error:", error);
    return { success: false, error: error.message };
  }
};
import nodemailer from "nodemailer";

// --- CONFIGURATION ---
const TRANSPORTER_CONFIG = {
  host: "mail.rpg.bu.ac.bd",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "officer@rpg.bu.ac.bd",
    pass: process.env.SMTP_PASSWORD, // Ensure this is in your .env.local
  },
};

const SENDER_IDENTITY = `"RPG System Officer" <officer@rpg.bu.ac.bd>`;

// --- PROFESSIONAL HTML TEMPLATE GENERATOR ---
const generateHtmlTemplate = (recipientName, mainContent, actionButton = null) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f7; margin: 0; padding: 0; }
        .email-wrapper { width: 100%; background-color: #f4f4f7; padding: 20px; }
        .email-content { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .email-header { background-color: #5c67f2; padding: 20px; text-align: center; color: #ffffff; }
        .email-header h1 { margin: 0; font-size: 20px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
        .email-body { padding: 30px; color: #333333; line-height: 1.6; }
        .email-body h2 { color: #333333; margin-top: 0; font-size: 18px; }
        .info-box { background-color: #f0f2f5; border-left: 4px solid #5c67f2; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .info-label { font-size: 12px; text-transform: uppercase; color: #666; font-weight: bold; display: block; margin-bottom: 4px; }
        .info-value { font-size: 16px; font-weight: 500; color: #000; font-family: 'Courier New', monospace; }
        .btn { display: inline-block; background-color: #5c67f2; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
        .email-footer { background-color: #f4f4f7; padding: 20px; text-align: center; color: #888888; font-size: 12px; }
        .divider { height: 1px; background-color: #e0e0e0; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="email-content">
          <div class="email-header">
            <h1>Research Project Management</h1>
          </div>
          
          <div class="email-body">
            <p>Dear <strong>${recipientName}</strong>,</p>
            
            ${mainContent}
            
            ${actionButton ? `<div style="text-align: center;">
              <a href="${actionButton.url}" class="btn">${actionButton.text}</a>
            </div>` : ''}
            
            <div class="divider"></div>
            <p style="font-size: 13px; color: #666;">
              This is an automated message from the Office of Research, Barishal University. 
              Please do not reply directly to this email unless instructed.
            </p>
          </div>
        </div>
        
        <div class="email-footer">
          &copy; ${new Date().getFullYear()} Barishal University. All rights reserved.<br>
          Research Project Management System (RPG)
        </div>
      </div>
    </body>
    </html>
  `;
};

// --- BASE SEND FUNCTION ---
const sendBaseEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport(TRANSPORTER_CONFIG);
    const info = await transporter.sendMail({
      from: SENDER_IDENTITY,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`📧 Email sent: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Email Error:", error);
    return { success: false, error: error.message };
  }
};

// ==========================================
// 🚀 EXPORTED FUNCTION 1: SEND NOTIFICATION
// ==========================================
/**
 * Sends a notification or reminder email.
 * @param {object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.name - Recipient name
 * @param {string} options.type - Notification Type
 * @param {string} options.projectTitle - Title of the project
 * @param {number|string} [options.amount] - Payment amount (for payment emails)
 * @param {string} [options.reviewType] - 'Proposal' or 'Final Report' (for reviewer payment)
 */
export const sendNotificationEmail = async ({ 
  to, 
  name, 
  type, 
  projectTitle, 
  amount = 0, 
  reviewType = "Proposal" 
}) => {
  let subject = "";
  let bodyContent = "";
  let button = null;

  const loginUrl = "https://rpg.bu.ac.bd/login"; 
  const formattedAmount = new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' }).format(amount);

  switch (type) {
    // --- PAYMENT: RESEARCHER ---
    case "PAYMENT_RESEARCHER":
      subject = `Fund Released: ${projectTitle}`;
      bodyContent = `
        <p>We are pleased to inform you that a fund release has been processed for your ongoing research project.</p>
        <div class="info-box">
          <div style="margin-bottom: 8px;">
            <span class="info-label">Project Title</span>
            ${projectTitle}
          </div>
          <div>
            <span class="info-label">Amount Released</span>
            <span class="info-value" style="color: #28a745;">${formattedAmount}</span>
          </div>
        </div>
        <p>Please log in to your dashboard to view the payment details and history.</p>
      `;
      button = { text: "View Payments", url: loginUrl };
      break;

    // --- PAYMENT: REVIEWER ---
    case "PAYMENT_REVIEWER":
      subject = `Honorarium Processed: ${projectTitle}`;
      bodyContent = `
        <p>We have processed the honorarium payment for your expert review service.</p>
        <div class="info-box">
          <div style="margin-bottom: 8px;">
            <span class="info-label">Review Task</span>
            ${reviewType} Review
          </div>
          <div style="margin-bottom: 8px;">
            <span class="info-label">Project Title</span>
            ${projectTitle}
          </div>
          <div>
            <span class="info-label">Payment Amount</span>
            <span class="info-value" style="color: #28a745;">${formattedAmount}</span>
          </div>
        </div>
        <p>Thank you for your valuable contribution to our research community.</p>
      `;
      button = { text: "View Dashboard", url: loginUrl };
      break;

    // --- NEW ASSIGNMENT ---
    case "REVIEWER_ASSIGNED":
      subject = `New Review Assignment: ${projectTitle}`;
      bodyContent = `
        <p>You have been assigned to review a project titled <strong>"${projectTitle}"</strong>.</p>
        <div class="info-box">
          <span class="info-label">Assignment Details</span>
          You have been selected as an expert reviewer for this project.
        </div>
        <p>Please log in to your dashboard to view the project details and submit your evaluation.</p>
      `;
      button = { text: "Go to Dashboard", url: loginUrl };
      break;

    // --- REMINDERS ---
    case "REVIEW_PROPOSAL":
      subject = `Reminder: Pending Proposal Review - ${projectTitle}`;
      bodyContent = `
        <p>This is a gentle reminder that you have a pending <strong>Project Proposal</strong> waiting for your review.</p>
        <div class="info-box">
          <span class="info-label">Project Title</span>
          ${projectTitle}
        </div>
        <p>Please log in to the portal to submit your evaluation at your earliest convenience.</p>
      `;
      button = { text: "Log In to Review", url: loginUrl };
      break;

    case "REVIEW_REPORT":
      subject = `Reminder: Pending Final Report Review - ${projectTitle}`;
      bodyContent = `
        <p>This is a reminder regarding the <strong>Final Report</strong> submitted for the project below. Your expert review is required.</p>
        <div class="info-box">
          <span class="info-label">Project Title</span>
          ${projectTitle}
        </div>
      `;
      button = { text: "Log In to Review", url: loginUrl };
      break;

    case "SUBMIT_REPORT":
      subject = `Action Required: Submit Final Report - ${projectTitle}`;
      bodyContent = `
        <p>Our records indicate that the <strong>Final Report</strong> for your project is due or pending submission.</p>
        <div class="info-box">
          <span class="info-label">Project Title</span>
          ${projectTitle}
        </div>
        <p>Please submit your final report documents through the dashboard to mark your project as completed.</p>
      `;
      button = { text: "Submit Report", url: loginUrl };
      break;

    // --- DECISIONS ---
    case "PROPOSAL_ACCEPTED":
      subject = `Proposal Accepted: ${projectTitle}`;
      bodyContent = `
        <p>We are pleased to inform you that your research proposal titled <strong>"${projectTitle}"</strong> has been <strong style="color: #28a745;">ACCEPTED</strong>.</p>
        <p>You may now proceed to the next phase of your research. Please check your dashboard for further instructions.</p>
      `;
      button = { text: "View Project", url: loginUrl };
      break;

    case "PROPOSAL_REJECTED":
      subject = `Update on Proposal: ${projectTitle}`;
      bodyContent = `
        <p>We appreciate the effort you put into your proposal <strong>"${projectTitle}"</strong>.</p>
        <p>After careful review, we regret to inform you that the proposal has <strong style="color: #dc3545;">NOT BEEN ACCEPTED</strong> at this time.</p>
        <p>We encourage you to log in and review the feedback provided by the reviewers.</p>
      `;
      button = { text: "View Feedback", url: loginUrl };
      break;

    case "REPORT_ACCEPTED":
      subject = `Final Report Accepted: ${projectTitle}`;
      bodyContent = `
        <p>Congratulations! Your final report for the project <strong>"${projectTitle}"</strong> has been <strong style="color: #28a745;">ACCEPTED</strong>.</p>
        <p>The project is now marked as <strong>COMPLETED</strong>. Thank you for your valuable contribution to research at Barishal University.</p>
      `;
      button = { text: "View Completion Status", url: loginUrl };
      break;

    case "REPORT_REJECTED":
      subject = `Action Required: Report Revision - ${projectTitle}`;
      bodyContent = `
        <p>Your final report for the project <strong>"${projectTitle}"</strong> has been reviewed.</p>
        <p>The reviewer has requested <strong style="color: #dc3545;">REVISIONS</strong> or clarifications. Please check the detailed comments in your dashboard and upload a revised version.</p>
      `;
      button = { text: "View Comments", url: loginUrl };
      break;

    default:
      throw new Error(`Invalid Notification Type: ${type}`);
  }

  const html = generateHtmlTemplate(name, bodyContent, button);
  return await sendBaseEmail(to, subject, html);
};

// Add this to your existing email library
export const sendInvitationEmail = async ({ to, name, token, roleLabel }) => {
  // const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${token}`;
  const inviteUrl = `${"localhost:3000"}/invite?token=${token}`;
  const subject = "Invitation to Join Research Management System";
  
  const bodyContent = `
    <p>You have been invited to join the <strong>Barishal University Research Project Management System</strong> as a <strong>${roleLabel}</strong>.</p>
    <p>An account has been pre-created for you. Please click the button below to set your password and complete your profile.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${inviteUrl}" style="background-color: #0d6efd; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
        Accept Invitation & Create Account
      </a>
    </div>

    <p style="color: #666; font-size: 13px;">
      Or copy-paste this link into your browser:<br>
      <a href="${inviteUrl}">${inviteUrl}</a>
    </p>
  `;

  // Use your existing html generator
  const html = generateHtmlTemplate(name, bodyContent); 
  return await sendBaseEmail(to, subject, html);
};



// ==========================================
// 🚀 EXPORTED FUNCTION 2: NEW USER LOGIN
// ==========================================
export const sendNewUserCredentials = async ({ to, name, password }) => {
  const subject = "Welcome to RPG System - Your Login Credentials";
  
  const bodyContent = `
    <p>Welcome to the <strong>Research Project Management System</strong> at Barishal University.</p>
    <p>An account has been created/updated for you by the administrative officer. Please use the credentials below to access your dashboard:</p>
    
    <div class="info-box">
      <div style="margin-bottom: 10px;">
        <span class="info-label">Email / Username</span>
        <span class="info-value">${to}</span>
      </div>
      <div>
        <span class="info-label">Temporary Password</span>
        <span class="info-value">${password}</span>
      </div>
    </div>

    <p style="color: #dc3545; font-size: 13px;">
      <strong>Security Note:</strong> For your security, we strongly recommend changing your password immediately after your first login.
    </p>
  `;

  const button = { text: "Access Dashboard", url: "https://rpg.bu.ac.bd/login" }; 

  const html = generateHtmlTemplate(name, bodyContent, button);
  return await sendBaseEmail(to, subject, html);
};
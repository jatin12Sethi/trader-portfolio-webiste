require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const multer = require('multer'); // To handle multipart/form-data if necessary

const app = express();
const PORT = process.env.PORT || 4000;
const ROOT = __dirname;
const upload = multer(); // in-memory parsing

// Middleware to parse JSON and urlencoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Legacy redirect: .html → clean URL (must come BEFORE static middleware) ──
app.get('/index.html', (req, res) => res.redirect(301, '/homepage'));
app.get('/about.html', (req, res) => res.redirect(301, '/about'));
app.get('/join.html',  (req, res) => res.redirect(301, '/join'));

// ─── Clean URL Routes ─────────────────────────────────────────────────────────

// Homepage
app.get(['/', '/homepage'], (req, res) => {
    res.sendFile(path.join(ROOT, 'index.html'));
});

// About page
app.get('/about', (req, res) => {
    res.sendFile(path.join(ROOT, 'about.html'));
});

// Join page
app.get('/join', (req, res) => {
    res.sendFile(path.join(ROOT, 'join.html'));
});

// ─── Serve static assets (css, js, images) ────────────────────────────────────
// Placed after route handlers so .html requests don't bypass redirects
app.use(express.static(ROOT, {
    index: false,      // Don't auto-serve index.html
    extensions: []     // Don't auto-append extensions
}));

// ─── API Routes ───────────────────────────────────────────────────────────────

// Configure Nodemailer transporter using credentials from .env
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Common Email Template wrapper for professional branding
const buildEmailTemplate = (title, content) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
    .email-header { background-color: #0f172a; padding: 30px 40px; text-align: center; border-bottom: 4px solid #d4af37; }
    .email-header h1 { margin: 0; color: #ffffff; font-size: 24px; letter-spacing: 1px; }
    .email-header h1 span { color: #d4af37; }
    .email-body { padding: 40px; color: #334155; line-height: 1.6; font-size: 16px; }
    .email-body h2 { color: #0f172a; margin-top: 0; font-size: 20px; }
    .details-box { background-color: #f1f5f9; padding: 20px; border-radius: 6px; margin: 25px 0; border-left: 4px solid #38bdf8; }
    .details-box p { margin: 8px 0; font-size: 14px; }
    .details-box strong { color: #0f172a; display: inline-block; width: 120px; }
    .email-footer { background-color: #f8fafc; padding: 25px 40px; text-align: center; color: #64748b; font-size: 13px; border-top: 1px solid #e2e8f0; }
    .btn { display: inline-block; padding: 12px 24px; background-color: #d4af37; color: #0f172a; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
</style>
</head>
<body>
    <div style="padding: 40px 20px; background-color: #f8fafc;">
        <div class="email-wrapper">
            <div class="email-header">
                <h1>Pro<span>Options</span></h1>
            </div>
            <div class="email-body">
                <h2>${title}</h2>
                ${content}
            </div>
            <div class="email-footer">
                <p>&copy; ${new Date().getFullYear()} Pro Options Selling. All Rights Reserved.</p>
                <p>Telegram: <a href="https://t.me/ProOptionSeller24" style="color:#38bdf8; text-decoration:none;">@ProOptionSeller24</a></p>
            </div>
        </div>
    </div>
</body>
</html>
`;

// Route: PDF Course Roadmap
app.post('/api/send-roadmap', upload.none(), async (req, res) => {
    const { name, email, phone, profession, interest } = req.body;

    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

    try {
        const content = `
            <p>Hi ${name ? name : 'Trader'},</p>
            <p>Thank you for your interest in the <strong>Pro Options Selling Mentorship</strong>!</p>
            <p>We've securely attached your exclusive <strong>12-Day Option Selling Business Program Roadmap PDF</strong> to this email. Make sure to download and review it.</p>
            
            <div class="details-box">
                <p><strong>Phone:</strong> ${phone || 'Not Provided'}</p>
                <p><strong>Profession:</strong> ${profession || 'Not Provided'}</p>
                <p><strong>Intent:</strong> ${interest || 'Not Provided'}</p>
            </div>

            <p>Our team has noted your profile. If you're serious about taking the next step towards consistent income, connect with us on Telegram or directly reply to this email.</p>
            <a href="https://t.me/ProOptionSeller24" class="btn">Message Us on Telegram</a>
        `;

        // 1. Email to the User
        const userMailOptions = {
            from: `"Pro Options Academy" <${process.env.SMTP_USER}>`,
            to: email, 
            subject: 'Your Pro Options Selling Course Roadmap is Here! 📈',
            html: buildEmailTemplate('Your Requested Roadmap', content),
            attachments: [
                {
                    filename: 'Pro Option Selling Course Roadmap.pdf',
                    path: path.join(ROOT, 'Pro Option Selling Course .pdf')
                }
            ]
        };

        // 2. Email to the Admin (You)
        const adminMailOptions = {
            from: `"Website Alerts" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            subject: `New PDF Download: ${name || email}`,
            text: `
A new user has downloaded the Course Roadmap PDF.

Details:
- Name: ${name || 'N/A'}
- Email: ${email}
- Phone: ${phone || 'N/A'}
- Profession: ${profession || 'N/A'}
- Intent: ${interest || 'N/A'}
            `
        };

        await transporter.sendMail(userMailOptions);
        await transporter.sendMail(adminMailOptions);
        
        console.log(`✅ [Roadmap PDF] sent to User (${email}) and Admin.`);
        res.json({ success: true, message: 'Email sent successfully!' });
    } catch (error) {
        console.error('❌ Error sending roadmap email:', error);
        res.status(500).json({ success: false, message: 'Failed to send email. Please try again later.' });
    }
});

// Route: Join Mentorship Form
app.post('/api/apply-mentorship', upload.none(), async (req, res) => {
    const { name, email, phone, experience, capital } = req.body;

    if (!email || !phone) return res.status(400).json({ success: false, message: 'Email and Phone are required.' });

    try {
        const content = `
            <p>Hi ${name ? name : 'Trader'},</p>
            <p>Congratulations on taking the first step towards professional trading. Your application for the <strong>Pro Options Selling Mentorship</strong> has been received successfully.</p>
            <p>Here is a summary of the details you submitted:</p>
            
            <div class="details-box">
                <p><strong>Participant:</strong> ${name || 'N/A'}</p>
                <p><strong>WhatsApp:</strong> ${phone}</p>
                <p><strong>Experience:</strong> ${experience || 'N/A'}</p>
                <p><strong>Capital:</strong> ${capital || 'N/A'}</p>
            </div>

            <p>Our team is reviewing your application against our strict onboarding criteria to ensure this mentorship is the right fit for your capital and mindset. One of our Senior Traders will reach out to you on WhatsApp within the next 24 hours.</p>
            
            <p>In the meantime, join our live Telegram community to see our daily trade logic and verified client reports.</p>
            <a href="https://t.me/ProOptionSeller24" class="btn">Join Telegram Community</a>
        `;

        // 1. Email to the User
        const userMailOptions = {
            from: `"Pro Options Academy" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Application Received: Pro Options Mentorship 🎯',
            html: buildEmailTemplate('Application Received', content),
        };

        // 2. Email to the Admin (You)
        const adminMailOptions = {
            from: `"Website Alerts" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            subject: `🚨 New Mentorship Application: ${name || email}`,
            text: `
A new user has submitted a Mentorship Application!

Details:
- Name: ${name || 'N/A'}
- Email: ${email}
- Phone: ${phone}
- Experience: ${experience || 'N/A'}
- Capital: ${capital || 'N/A'}

Action Required: Reach out to them on WhatsApp at ${phone}.
            `
        };

        await transporter.sendMail(userMailOptions);
        await transporter.sendMail(adminMailOptions);
        
        console.log(`✅ [Application] sent to User (${email}) and Admin.`);
        res.json({ success: true, message: 'Application submitted successfully!' });
    } catch (error) {
        console.error('❌ Error sending application email:', error);
        res.status(500).json({ success: false, message: 'Failed to process application. Please try again later.' });
    }
});

// ─── Catch-all: unknown routes → homepage ─────────────────────────────────────
app.use((req, res) => {
    res.redirect('/homepage');
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n✅ Pro Options Seller running at http://localhost:${PORT}`);
    console.log(`   /homepage  →  index.html`);
    console.log(`   /about     →  about.html`);
    console.log(`   /join      →  join.html\n`);
});

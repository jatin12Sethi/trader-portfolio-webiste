<?php
/**
 * Pro Options Seller — PHP API Backend
 * Handles email sending for PDF Roadmap & Mentorship Application forms.
 * Uses PHPMailer with Gmail SMTP.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/PHPMailer/src/Exception.php';
require_once __DIR__ . '/PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// ─── CORS & Headers ────────────────────────────────────────────
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Only POST requests are accepted.']);
    exit;
}

// ─── Routing ────────────────────────────────────────────────────
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Accept both JSON body and form-encoded data
$contentType = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';
if (stripos($contentType, 'application/json') !== false) {
    $data = json_decode(file_get_contents('php://input'), true);
} else {
    $data = $_POST;
}

switch ($action) {
    case 'send_roadmap':
        handleSendRoadmap($data);
        break;
    case 'apply_mentorship':
        handleApplyMentorship($data);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action.']);
        break;
}

// ─── Helpers ────────────────────────────────────────────────────

function createMailer() {
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASS;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = SMTP_PORT;
    $mail->setFrom(SMTP_USER, 'Pro Options Academy');
    $mail->isHTML(true);
    return $mail;
}

function buildEmailTemplate($title, $content) {
    return '<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
body{margin:0;padding:0;background:#0a0e1a;font-family:Arial,Helvetica,sans-serif}
.wrapper{max-width:600px;margin:0 auto;background:#0f1629;border:1px solid #1a2040;border-radius:12px;overflow:hidden}
.header{background:linear-gradient(135deg,#0f1629 0%,#1a2040 100%);padding:30px 20px;text-align:center;border-bottom:2px solid #c9a544}
.header img{height:40px}
.header h1{color:#c9a544;font-size:22px;margin:15px 0 0}
.body-content{padding:30px 25px;color:#ccc;font-size:15px;line-height:1.7}
.body-content p{margin:12px 0}
.body-content strong{color:#fff}
.details-box{background:#1a2040;border-left:3px solid #c9a544;padding:15px 20px;border-radius:6px;margin:20px 0}
.details-box p{margin:6px 0;color:#ddd}
.btn{display:inline-block;background:linear-gradient(135deg,#c9a544,#e8c962);color:#0a0e1a !important;text-decoration:none;padding:12px 30px;border-radius:8px;font-weight:bold;margin-top:20px}
.footer{background:#080c16;padding:20px;text-align:center;color:#666;font-size:12px;border-top:1px solid #1a2040}
</style></head><body>
<div class="wrapper">
  <div class="header">
    <h1>PRO OPTIONS SELLER</h1>
    <p style="color:#c9a544;margin:5px 0 0;font-size:13px">Professional Option Selling Mentorship</p>
  </div>
  <div class="body-content">
    <h2 style="color:#c9a544;font-size:20px;margin-top:0">' . $title . '</h2>
    ' . $content . '
  </div>
  <div class="footer">
    <p>&copy; ' . date('Y') . ' Pro Options Seller. All rights reserved.</p>
    <p>This is an automated email. Please do not reply directly.</p>
  </div>
</div>
</body></html>';
}

// ─── Route Handlers ─────────────────────────────────────────────

function handleSendRoadmap($data) {
    $name       = isset($data['name']) ? $data['name'] : 'Trader';
    $email      = isset($data['email']) ? $data['email'] : '';
    $phone      = isset($data['phone']) ? $data['phone'] : 'N/A';
    $profession = isset($data['profession']) ? $data['profession'] : 'N/A';
    $interest   = isset($data['interest']) ? $data['interest'] : 'N/A';

    if (empty($email)) {
        echo json_encode(['success' => false, 'message' => 'Email is required.']);
        return;
    }

    $content = '
        <p>Hi ' . htmlspecialchars($name) . ',</p>
        <p>Thank you for your interest in the <strong>Pro Options Selling Mentorship</strong>!</p>
        <p>We\'ve securely attached your exclusive <strong>12-Day Option Selling Business Program Roadmap PDF</strong> to this email. Make sure to download and review it.</p>
        <div class="details-box">
            <p><strong>Phone:</strong> ' . htmlspecialchars($phone) . '</p>
            <p><strong>Profession:</strong> ' . htmlspecialchars($profession) . '</p>
            <p><strong>Intent:</strong> ' . htmlspecialchars($interest) . '</p>
        </div>
        <p>Our team has noted your profile. If you\'re serious about taking the next step towards consistent income, connect with us on Telegram or directly reply to this email.</p>
        <a href="https://t.me/ProOptionSeller24" class="btn">Message Us on Telegram</a>';

    try {
        // 1. Email to User
        $mail = createMailer();
        $mail->addAddress($email, $name);
        $mail->Subject = 'Your Pro Options Selling Course Roadmap is Here! 📈';
        $mail->Body    = buildEmailTemplate('Your Requested Roadmap', $content);
        $pdfPath = __DIR__ . '/Pro Option Selling Course .pdf';
        if (file_exists($pdfPath)) {
            $mail->addAttachment($pdfPath, 'Pro Option Selling Course Roadmap.pdf');
        }
        $mail->send();

        // 2. Email to Admin
        $admin = createMailer();
        $admin->addAddress(SMTP_USER);
        $admin->Subject = 'New PDF Download: ' . $name;
        $admin->isHTML(false);
        $admin->Body = "A new user has downloaded the Course Roadmap PDF.\n\nDetails:\n- Name: $name\n- Email: $email\n- Phone: $phone\n- Profession: $profession\n- Intent: $interest";
        $admin->send();

        echo json_encode(['success' => true, 'message' => 'Email sent successfully!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to send email: ' . $e->getMessage()]);
    }
}

function handleApplyMentorship($data) {
    $name       = isset($data['name']) ? $data['name'] : 'Trader';
    $email      = isset($data['email']) ? $data['email'] : '';
    $phone      = isset($data['phone']) ? $data['phone'] : '';
    $experience = isset($data['experience']) ? $data['experience'] : 'N/A';
    $capital    = isset($data['capital']) ? $data['capital'] : 'N/A';

    if (empty($email) || empty($phone)) {
        echo json_encode(['success' => false, 'message' => 'Email and Phone are required.']);
        return;
    }

    $content = '
        <p>Hi ' . htmlspecialchars($name) . ',</p>
        <p>Congratulations on taking the first step towards professional trading. Your application for the <strong>Pro Options Selling Mentorship</strong> has been received successfully.</p>
        <p>Here is a summary of the details you submitted:</p>
        <div class="details-box">
            <p><strong>Participant:</strong> ' . htmlspecialchars($name) . '</p>
            <p><strong>WhatsApp:</strong> ' . htmlspecialchars($phone) . '</p>
            <p><strong>Experience:</strong> ' . htmlspecialchars($experience) . '</p>
            <p><strong>Capital:</strong> ' . htmlspecialchars($capital) . '</p>
        </div>
        <p>Our team is reviewing your application against our strict onboarding criteria to ensure this mentorship is the right fit for your capital and mindset. One of our Senior Traders will reach out to you on WhatsApp within the next 24 hours.</p>
        <p>In the meantime, join our live Telegram community to see our daily trade logic and verified client reports.</p>
        <a href="https://t.me/ProOptionSeller24" class="btn">Join Telegram Community</a>';

    try {
        // 1. Email to User
        $mail = createMailer();
        $mail->addAddress($email, $name);
        $mail->Subject = 'Application Received: Pro Options Mentorship 🎯';
        $mail->Body    = buildEmailTemplate('Application Received', $content);
        $mail->send();

        // 2. Email to Admin
        $admin = createMailer();
        $admin->addAddress(SMTP_USER);
        $admin->Subject = '🚨 New Mentorship Application: ' . $name;
        $admin->isHTML(false);
        $admin->Body = "A new user has submitted a Mentorship Application!\n\nDetails:\n- Name: $name\n- Email: $email\n- Phone: $phone\n- Experience: $experience\n- Capital: $capital\n\nAction Required: Reach out to them on WhatsApp at $phone.";
        $admin->send();

        echo json_encode(['success' => true, 'message' => 'Application submitted successfully!']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Failed to process application: ' . $e->getMessage()]);
    }
}
?>

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

// ✅ Enable CORS properly
app.use(cors());

// ✅ VERY IMPORTANT: manually allow OPTIONS
app.options("/send-reminder", cors());

// ✅ Parse JSON
app.use(express.json());
// Setup Email Transporter
app.get("/", (req, res) => {
  res.send("Backend is running");
});
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ============================================================================
// ROUTE 1: DAILY HABIT REMINDERS (Triggers at specific times)
// ============================================================================
app.post("/send-reminder", async (req, res) => {
  const { to, subject, text } = req.body;
  const cleanHeading = subject
    .replace("⏰ Time for ", "")
    .replace("📋 Weekly Task: ", "");

  const reminderHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>LifeTrack Reminder</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background-color: #0e0b07; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .jost { font-family: 'Jost', Arial, sans-serif; }
    .serif { font-family: 'Cormorant Garamond', Georgia, serif; }
  </style>
</head>
<body style="background-color: #0e0b07; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0e0b07; padding: 40px 20px;">
    <tr>
      <td align="center">
        <div style="text-align: center; margin-bottom: 30px;">
          <div class="serif" style="font-size: 28px; font-weight: 300; color: #ede5d8; letter-spacing: 0.08em;">
            life<span style="color: #c49a78;">·</span>track
          </div>
          <div style="width: 40px; height: 1px; background-color: #c49a78; margin: 12px auto 0;"></div>
        </div>
        <table width="100%" max-width="560" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; background-color: #18150f; border: 1px solid #2e2820; border-radius: 20px; overflow: hidden;">
          <tr><td height="3" style="background-color: #c49a78;"></td></tr>
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <div style="width: 72px; height: 72px; border-radius: 50%; background-color: #201c14; border: 2px solid #3a3020; margin: 0 auto 24px; text-align: center; line-height: 72px; font-size: 32px; color: #c49a78;">✦</div>
              <div style="display: inline-block; background-color: #201c14; border: 1px solid #3a3020; border-radius: 30px; padding: 6px 18px; font-size: 11px; font-weight: bold; letter-spacing: 0.15em; text-transform: uppercase; color: #c49a78; margin-bottom: 16px; font-family: 'Jost', Arial, sans-serif;">
                ${subject}
              </div>
              <div class="serif" style="font-size: 13px; color: #6e6056; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px;">Wellness Reminder</div>
              <h1 class="serif" style="font-size: 32px; font-weight: normal; color: #ede5d8; line-height: 1.2; margin: 0 0 10px 0;">Time for your<br/><i style="color: #c49a78;">daily ritual</i></h1>
              <p class="jost" style="font-size: 14px; color: #7a6e63; line-height: 1.6; margin: 0 0 30px 0;">Your habit reminder is here. A small consistent act<br/>is the foundation of lasting change.</p>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #201c14; border: 1px solid #2e2820; border-radius: 14px; padding: 18px; margin-bottom: 30px;">
                <tr>
                  <td width="60" valign="middle" align="center">
                    <div style="width: 48px; height: 48px; background-color: #28231a; border: 1px solid #3a3020; border-radius: 12px; text-align: center; line-height: 48px; font-size: 22px; color: #c49a78;">✦</div>
                  </td>
                  <td valign="middle" style="text-align: left; padding-left: 12px;">
                    <div class="jost" style="font-size: 10px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; color: #5e5448; margin-bottom: 4px;">Your Task</div>
                    <div class="serif" style="font-size: 22px; color: #ede5d8; margin-bottom: 4px;">${cleanHeading}</div>
                    <div class="jost" style="font-size: 12px; color: #8a7a6a;">${text}</div>
                  </td>
                </tr>
              </table>

              
              <div style="height: 1px; background-color: #2e2820; margin: 0 auto 24px; width: 80%;"></div>
              
              <div style="padding: 0 10px;">
                <div class="serif" style="font-size: 40px; color: #2e2820; line-height: 0.6; margin-bottom: 8px;">"</div>
                <div class="serif" style="font-size: 18px; color: #5e5448; font-style: italic; line-height: 1.5;">We are what we repeatedly do. Excellence, then, is not an act, but a habit.</div>
                <div class="jost" style="font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #6e6056; margin-top: 12px;">— Aristotle</div>
              </div>
            </td>
          </tr>
        </table>
        <table width="100%" max-width="560" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; text-align: center; margin-top: 30px;">
          <tr>
            <td>
              <div class="serif" style="font-size: 16px; color: #5e4a38; letter-spacing: 0.08em; margin-bottom: 12px;">life·track</div>
              <div class="jost" style="font-size: 10px; color: #3a3028; letter-spacing: 0.04em; line-height: 1.8;">You're receiving this because you set a reminder in LifeTrack.<br/>© ${new Date().getFullYear()} LifeTrack · Made with care for your wellness journey.</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"life·track" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text,
      html: reminderHtml,
    });
    console.log("Daily Reminder email sent: " + info.response);
    res.status(200).json({ success: true, message: "Reminder sent!" });
  } catch (error) {
    console.error("Failed to send daily reminder:", error);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

// ============================================================================
// ROUTE 2: WEEKLY BACKUP & RESET (Triggers on Monday mornings)
// ============================================================================
app.post("/send-weekly-backup", async (req, res) => {
  const { to, htmlReport } = req.body;

  // Dynamic Date Calculations
  const today = new Date();
  const currentDay = today.getDay() || 7;
  const prevSun = new Date(today);
  prevSun.setDate(today.getDate() - currentDay);
  const prevMon = new Date(prevSun);
  prevMon.setDate(prevSun.getDate() - 6);

  const dateRange = `${prevMon.getDate()} – ${prevSun.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}`;
  const resetDate =
    today.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }) + " · 12:00 AM";

  const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
  const pastDaysOfYear = (today - firstDayOfYear) / 86400000;
  const currentWeekNum = Math.ceil(
    (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7,
  );
  const lastWeekNum = currentWeekNum - 1;

  const resetHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>LifeTrack — Weekly Data Reset</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0e0b07; font-family: 'Jost', sans-serif; -webkit-font-smoothing: antialiased; }
    .wrapper { max-width: 520px; margin: 0 auto; padding: 40px 20px; }
    .logo { text-align: center; margin-bottom: 28px; }
    .logo-text { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 300; color: #ede5d8; letter-spacing: 0.08em; }
    .logo-text span { color: #c49a78; }
    .logo-line { width: 32px; height: 1px; background: linear-gradient(90deg, transparent, #c49a78, transparent); margin: 10px auto 0; }
    .card { background: #18150f; border: 1px solid #2a2318; border-radius: 16px; overflow: hidden; }
    .card-top-bar { height: 3px; background: linear-gradient(90deg, #6b4a2a, #c49a78, #d4b48e, #c49a78, #6b4a2a); }
    .card-body { padding: 32px 34px 28px; }
    .alert-icon-wrap { display: flex; justify-content: center; margin-bottom: 22px; }
    .alert-icon { width: 56px; height: 56px; border-radius: 50%; background: rgba(196,122,106,0.1); border: 1px solid rgba(196,122,106,0.25); display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .heading { text-align: center; margin-bottom: 20px; }
    .badge { display: inline-block; font-size: 10px; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase; color: #d4907c; background: rgba(212,144,124,0.1); border: 1px solid rgba(212,144,124,0.2); padding: 4px 12px; border-radius: 20px; margin-bottom: 12px; }
    .title { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 400; color: #ede5d8; line-height: 1.2; letter-spacing: 0.01em; margin-bottom: 8px; }
    .title em { font-style: italic; color: #d4907c; }
    .subtitle { font-size: 13px; font-weight: 300; color: #6e6056; line-height: 1.6; }
    .divider { height: 1px; background: linear-gradient(90deg, transparent, #2e2820, transparent); margin: 22px 0; }
    .info-row { display: flex; align-items: center; gap: 14px; background: #201c14; border: 1px solid #2e2820; border-radius: 12px; padding: 16px 18px; margin-bottom: 16px; }
    .info-icon { font-size: 22px; flex-shrink: 0; width: 38px; text-align: center; }
    .info-label { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #5e5448; margin-bottom: 3px; }
    .info-val { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 400; color: #ede5d8; }
    .warning-box { background: rgba(212,144,124,0.07); border: 1px solid rgba(212,144,124,0.2); border-left: 3px solid #d4907c; border-radius: 10px; padding: 14px 16px; margin-bottom: 22px; display: flex; gap: 12px; align-items: flex-start; }
    .warning-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
    .warning-text { font-size: 13px; color: #c49a78; line-height: 1.6; }
    .warning-text strong { color: #d4907c; font-weight: 600; }
    .attachment-label { font-size: 9px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #5e5448; margin-bottom: 10px; }
    .attachment-card { display: flex; align-items: center; gap: 14px; background: #201c14; border: 1px solid #2e2820; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px; text-decoration: none; transition: border-color 0.2s; cursor: pointer; }
    .attachment-card:hover { border-color: #c49a78; }
    .pdf-icon { width: 40px; height: 40px; background: rgba(196,154,120,0.1); border: 1px solid rgba(196,154,120,0.2); border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
    .attachment-name { font-size: 13px; font-weight: 500; color: #ede5d8; margin-bottom: 3px; }
    .attachment-meta { font-size: 11px; color: #5e5448; }
    .attachment-download { margin-left: auto; font-size: 11px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: #c49a78; flex-shrink: 0; }
    .cta-wrap { text-align: center; margin-bottom: 24px; }
    .cta-btn { display: inline-block; background: linear-gradient(135deg, #b8906a, #c49a78); color: #18150f; font-family: 'Jost', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; text-decoration: none; padding: 12px 32px; border-radius: 50px; }
    .cta-note { display: block; margin-top: 10px; font-size: 11px; color: #5e5448; letter-spacing: 0.04em; }
    .footer { text-align: center; padding-top: 26px; }
    .footer-logo { font-family: 'Cormorant Garamond', serif; font-size: 14px; font-weight: 300; color: #3a3028; letter-spacing: 0.08em; margin-bottom: 10px; }
    .footer-logo span { color: #5e4a38; }
    .footer-links { font-size: 10px; color: #3a3028; letter-spacing: 0.06em; margin-bottom: 10px; }
    .footer-links a { color: #5e4a38; text-decoration: none; margin: 0 6px; }
    .footer-note { font-size: 10px; color: #2e2820; line-height: 1.8; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="logo">
      <div class="logo-text">life<span>·</span>track</div>
      <div class="logo-line"></div>
    </div>
    <div class="card">
      <div class="card-top-bar"></div>
      <div class="card-body">
        <div class="alert-icon-wrap"><div class="alert-icon">🗑️</div></div>
        
        <div class="heading">
          <div class="badge">Weekly Reset</div>
          <div class="title">Last week's data<br/>has been <em>cleared</em></div>
          <div class="subtitle">Your Week ${lastWeekNum} records have been removed<br/>to keep your tracker fresh for the new week.</div>
        </div>
        <div class="divider"></div>

        <div class="info-row">
          <div class="info-icon">📅</div>
          <div>
            <div class="info-label">Period Deleted</div>
            <div class="info-val">${dateRange} (Week ${lastWeekNum})</div>
          </div>
        </div>
        <div class="info-row" style="margin-bottom:20px">
          <div class="info-icon">⏰</div>
          <div>
            <div class="info-label">Reset Time</div>
            <div class="info-val">${resetDate}</div>
          </div>
        </div>

        <div class="warning-box">
          <div class="warning-icon">⚠️</div>
          <div class="warning-text">
            <strong>Didn't download your report?</strong> No worries — your last week's full wellness report is attached below. Save it now before this email expires.
          </div>
        </div>

        <div class="attachment-label">📎 Attached Report</div>
        <a class="attachment-card" href="#">
          <div class="pdf-icon">📄</div>
          <div>
            <div class="attachment-name">LifeTrack_Week${lastWeekNum}_Report.html</div>
            <div class="attachment-meta">${dateRange} · Weekly Wellness Report</div>
          </div>
          <div class="attachment-download">↓ Save</div>
        </a>

        <div class="cta-wrap">
          <a class="cta-btn" href="#">Start Week ${currentWeekNum} Fresh →</a>
          <span class="cta-note">Your new weekly tracker is ready and waiting.</span>
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="footer-logo">life<span>·</span>track</div>
      <div class="footer-note">
        This is an automated reset notification from LifeTrack.<br/>
        © ${today.getFullYear()} LifeTrack · Your personal wellness companion.
      </div>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"life·track" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `Your Week ${lastWeekNum} Report & Reset 🗓️`,
      html: resetHtml,
      attachments: [
        {
          filename: `LifeTrack_Week${lastWeekNum}_Report.html`,
          content: htmlReport,
          contentType: "text/html",
        },
      ],
    });
    console.log(`Weekly Backup email sent for Week ${lastWeekNum}!`);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Failed to send backup:", error);
    res.status(500).json({ error: "Failed" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

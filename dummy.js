console.log("🔥 Server file executed");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const fs = require("fs");

const app = express();

// ✅ Enable CORS properly
app.use(cors());

// ✅ Parse JSON
app.use(express.json({ limit: "10mb" }));

// 1. CONFIGURE GMAIL TRANSPORTER
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// HEALTH CHECK
app.get("/", (req, res) => {
  res.send("LifeTrack Backend (OTP Version) is successfully running! 🚀");
});

// ============================================================================
// 1. DATABASE & OTP STORAGE
// ============================================================================
const USERS_FILE = "./users.json";
const SCHEDULES_FILE = "./schedules.json";

let usersDB = {};
let schedulesDB = {};
let tempOTPs = {}; // Temporarily stores OTPs before account creation

// Load existing schedules when server starts
if (fs.existsSync(USERS_FILE)) {
  try {
    usersDB = JSON.parse(fs.readFileSync(USERS_FILE));
  } catch (e) {
    console.error("Failed to load users DB");
  }
}
if (fs.existsSync(SCHEDULES_FILE)) {
  try {
    schedulesDB = JSON.parse(fs.readFileSync(SCHEDULES_FILE));
  } catch (e) {
    console.error("Failed to load schedules DB");
  }
}

// ============================================================================
// 2. AUTHENTICATION ROUTES (OTP SYSTEM)
// ============================================================================

// STEP A: Request Signup (Generates and sends OTP)
app.post("/request-signup", async (req, res) => {
  const { name, email, password } = req.body;
  const lowerEmail = email.toLowerCase().trim();
  const lowerUser = name.toLowerCase().trim();

  // Check if Email already exists
  if (usersDB[lowerEmail]) {
    return res
      .status(400)
      .json({ success: false, error: "This email is already registered." });
  }

  // Check if Username already exists
  const usernameTaken = Object.values(usersDB).some(
    (u) => u.username && u.username.toLowerCase() === lowerUser,
  );
  if (usernameTaken) {
    return res.status(400).json({
      success: false,
      error: "Username taken. Try adding numbers (e.g., Teja29).",
    });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store user data temporarily
  tempOTPs[lowerEmail] = { otp, userData: { ...req.body, username: name } };

  // Send the OTP via Email
  await sendEmail(
    lowerEmail,
    "Verify your LifeTrack Account",
    `Your verification code is ${otp}. Please enter this in the app to create your account.`,
    "Email Verification",
  );

  console.log(`🔑 OTP generated for ${lowerEmail}: ${otp}`);
  res.status(200).json({ success: true, message: "OTP sent to your email." });
});

// STEP B: Verify OTP and Create Account
app.post("/verify-signup", (req, res) => {
  const { email, otp } = req.body;
  const lowerEmail = email.toLowerCase().trim();

  if (tempOTPs[lowerEmail] && tempOTPs[lowerEmail].otp === otp) {
    const data = tempOTPs[lowerEmail].userData;

    // Save credentials to usersDB
    usersDB[lowerEmail] = data;
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersDB, null, 2));

    // Initialize an empty schedule
    schedulesDB[lowerEmail] = { timezone: "", reminders: [], weeklyTasks: [] };
    fs.writeFileSync(SCHEDULES_FILE, JSON.stringify(schedulesDB, null, 2));

    // Delete the temporary OTP
    delete tempOTPs[lowerEmail];

    return res
      .status(200)
      .json({ success: true, message: "Account created successfully!" });
  }

  res.status(400).json({ success: false, error: "Invalid OTP code." });
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const lowerEmail = email.toLowerCase().trim();

  if (!lowerEmail || !password) {
    return res
      .status(400)
      .json({ success: false, error: "Email and password required" });
  }

  const user = usersDB[lowerEmail];

  if (!user) {
    return res
      .status(404)
      .json({ success: false, error: "User not found. Please sign up." });
  }
  if (user.pass !== password) {
    return res
      .status(401)
      .json({ success: false, error: "Incorrect password." });
  }

  const userSchedule = schedulesDB[lowerEmail] || {};

  res.status(200).json({
    success: true,
    message: "Login successful!",
    userData: {
      username: user.username,
      email: lowerEmail,
      reminders: userSchedule.reminders || [],
      weeklyTasks: userSchedule.weeklyTasks || [],
    },
  });
});

// SYNC SCHEDULE
app.post("/sync-schedule", (req, res) => {
  const { email, timezone, reminders, weeklyTasks } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  if (!schedulesDB[email]) schedulesDB[email] = {};
  schedulesDB[email].timezone = timezone;
  schedulesDB[email].reminders = reminders;
  schedulesDB[email].weeklyTasks = weeklyTasks;
  fs.writeFileSync(SCHEDULES_FILE, JSON.stringify(schedulesDB, null, 2));

  res.status(200).json({ success: true, message: "Schedule Synced!" });
});

// ============================================================================
// 3. EMAIL HELPER FUNCTION
// ============================================================================
async function sendEmail(to, subject, text, heading) {
  const reminderHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>LifeTrack Notification</title>
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
              <h1 class="serif" style="font-size: 32px; font-weight: normal; color: #ede5d8; line-height: 1.2; margin: 0 0 10px 0;">${heading}</h1>
              <p class="jost" style="font-size: 14px; color: #7a6e63; line-height: 1.6; margin: 0 0 30px 0;">${text}</p>
            </td>
          </tr>
        </table>
        <table width="100%" max-width="560" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; text-align: center; margin-top: 30px;">
          <tr>
            <td>
              <div class="serif" style="font-size: 16px; color: #5e4a38; letter-spacing: 0.08em; margin-bottom: 12px;">life·track</div>
              <div class="jost" style="font-size: 10px; color: #3a3028; letter-spacing: 0.04em; line-height: 1.8;">© ${new Date().getFullYear()} LifeTrack · Made with care for your wellness journey.</div>
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
      from: `"LifeTrack" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: subject,
      html: reminderHtml,
    });
    console.log(
      `✅ Email sent to ${to} for ${subject} | ID: ${info.messageId}`,
    );
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
}

// ============================================================================
// 4. THE 24/7 BACKGROUND CLOCK
// ============================================================================
let lastCheckedMinute = "";

setInterval(() => {
  const now = new Date();
  const currentMinute = now.toISOString().slice(0, 16);

  if (currentMinute === lastCheckedMinute) return;
  lastCheckedMinute = currentMinute;

  console.log(`\n⏱️ CLOCK TICK: ${currentMinute} UTC`);

  Object.entries(schedulesDB).forEach(([email, data]) => {
    try {
      if (!data.timezone) return;

      const userTimeStr = now.toLocaleTimeString("en-US", {
        timeZone: data.timezone,
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });
      const userDayStr = now.toLocaleDateString("en-US", {
        timeZone: data.timezone,
        weekday: "long",
      });

      // Check Daily Habit Timers
      (data.reminders || []).forEach((r) => {
        (r.timers || []).forEach((t) => {
          if (t.time === userTimeStr) {
            sendEmail(
              email,
              `⏰ Time for ${r.habitName}`,
              t.label || `Time for your ${r.habitName} routine!`,
              `Your Task: ${r.habitName}`,
            );
          }
        });
      });

      // Check Weekly Task Timers
      (data.weeklyTasks || []).forEach((task) => {
        if (
          task.day === userDayStr &&
          task.reminderTime === userTimeStr &&
          !task.doneThisWeek
        ) {
          sendEmail(
            email,
            `📋 Weekly Task: ${task.name}`,
            `Don't forget to complete your task: ${task.name}`,
            `Weekly Goal: ${task.name}`,
          );
        }
      });
    } catch (err) {
      console.error("Error processing user schedule:", err);
    }
  });
}, 10000);

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on port", PORT);
});

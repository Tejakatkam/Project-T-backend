console.log("🔥 Server file executed");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.send("LifeTrack Backend is successfully running! 🚀");
});

const resend = new Resend(process.env.RESEND_API_KEY);

/* ============================================================
   🧠 TEMP MEMORY STORAGE (Free Version)
============================================================ */
let reminders = [];

/* ============================================================
   ✅ SAVE REMINDER (Called From Frontend When User Sets Time)
============================================================ */
app.post("/save-reminder", (req, res) => {
  const { email, habitName, time } = req.body;

  reminders.push({
    email,
    habitName,
    time, // format: "18:30"
    lastSent: null,
  });

  console.log("Reminder saved:", email, habitName, time);

  res.json({ success: true });
});

/* ============================================================
   ⏰ BACKEND SCHEDULER (Runs Every 1 Minute Automatically)
============================================================ */
setInterval(async () => {
  const now = new Date();

  const currentTime =
    now.getHours().toString().padStart(2, "0") +
    ":" +
    now.getMinutes().toString().padStart(2, "0");

  reminders.forEach(async (reminder) => {
    if (reminder.time === currentTime) {
      if (reminder.lastSent === currentTime) return;

      reminder.lastSent = currentTime;

      try {
        await resend.emails.send({
          from: "LifeTrack <onboarding@resend.dev>",
          to: reminder.email,
          subject: `⏰ Time for ${reminder.habitName}`,
          html: `<h2>Time for ${reminder.habitName}</h2>`,
        });

        console.log("Reminder sent to:", reminder.email);
      } catch (err) {
        console.error("Reminder failed:", err);
      }
    }
  });
}, 60000); // every 1 minute

/* ============================================================
   📧 MANUAL SEND ROUTE (Keep Your Original Feature)
============================================================ */
app.post("/send-reminder", async (req, res) => {
  const { to, subject, text } = req.body;

  try {
    const response = await resend.emails.send({
      from: "LifeTrack <onboarding@resend.dev>",
      to: to,
      subject: subject,
      html: text,
    });

    console.log("Email sent:", response);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Failed to send daily reminder:", error);
    res.status(500).json({ success: false });
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});

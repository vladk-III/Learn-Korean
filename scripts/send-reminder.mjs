// Sends the streak-reminder push. Run hourly by .github/workflows/reminders.yml.
// REMINDER_CONFIG is the setup code from the app (Me → Streak reminders).
import webpush from "web-push";

const raw = process.env.REMINDER_CONFIG?.trim();
const test = process.env.TEST === "true";

if (!raw) {
  console.log("REMINDER_CONFIG secret not set — reminders are off. Turn them on in the app (Me → Streak reminders).");
  process.exit(0);
}

let config;
try {
  config = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
} catch {
  console.error("REMINDER_CONFIG isn't a valid setup code. Copy it again from the app.");
  process.exit(1);
}

const { subscription, vapid, tz, hours } = config;
const hour = Number(new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: tz }).format(new Date()));

if (!test && !hours.includes(hour)) {
  console.log(`It's ${hour}:00 in ${tz}; reminders are set for ${hours.join(", ")}:00. Nothing to send.`);
  process.exit(0);
}

const stage = test ? "test" : hour === Math.max(...hours) ? "final" : "evening";
webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

try {
  const res = await webpush.sendNotification(subscription, JSON.stringify({ stage }), { TTL: 3 * 3600, urgency: "high" });
  console.log(`Sent ${stage} reminder (${hour}:00 ${tz}) — push service replied ${res.statusCode}.`);
} catch (err) {
  if (err.statusCode === 404 || err.statusCode === 410) {
    console.error("The phone's subscription has expired. Turn reminders off and on again in the app, then update the secret.");
  } else {
    console.error("Push failed:", err.statusCode ?? "", err.body ?? err.message);
  }
  process.exit(1);
}

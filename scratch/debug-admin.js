const fs = require('fs');
const path = require('path');

// Mocking the behavior of isAdminEmail and isAdminPassword without importing
function isAdminEmail(email, adminEmails) {
  const list = (adminEmails ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const e = (email ?? "").trim().toLowerCase();
  return !!e && list.includes(e);
}

function isAdminPassword(pw, adminPassword) {
  const expected = adminPassword ?? "";
  return !!expected && (pw ?? "") === expected;
}

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join('=').trim().replace(/^"(.*)"$/, '$1');
  }
});

const testEmail = "admin@admin.com";
const testPassword = "admin@123";

console.log("Parsed ADMIN_EMAILS:", `[${env.ADMIN_EMAILS}]`);
console.log("Parsed ADMIN_PASSWORD:", `[${env.ADMIN_PASSWORD}]`);

console.log("isAdminEmail result:", isAdminEmail(testEmail, env.ADMIN_EMAILS));
console.log("isAdminPassword result:", isAdminPassword(testPassword, env.ADMIN_PASSWORD));

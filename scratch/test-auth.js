
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

function isAdminEmail(email) {
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const e = (email ?? "").trim().toLowerCase();
  return !!e && list.includes(e);
}

function isAdminPassword(pw) {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  return !!expected && (pw ?? "") === expected;
}

console.log("Testing Admin Auth Logic:");
console.log("ADMIN_EMAILS from env:", process.env.ADMIN_EMAILS);
console.log("ADMIN_PASSWORD from env:", process.env.ADMIN_PASSWORD);

const testEmail = "admin@admin.com";
const testPassword = "admin@123";

console.log(`Testing with ${testEmail} / ${testPassword}`);
console.log("isAdminEmail:", isAdminEmail(testEmail));
console.log("isAdminPassword:", isAdminPassword(testPassword));

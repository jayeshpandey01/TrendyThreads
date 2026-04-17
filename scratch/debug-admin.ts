import { isAdminEmail, isAdminPassword } from "./src/lib/admin";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const testEmail = "admin@admin.com";
const testPassword = "admin@123";

console.log("ADMIN_EMAILS:", process.env.ADMIN_EMAILS);
console.log("ADMIN_PASSWORD:", process.env.ADMIN_PASSWORD);
console.log("Testing Email:", testEmail);
console.log("Testing Password:", testPassword);

console.log("isAdminEmail result:", isAdminEmail(testEmail));
console.log("isAdminPassword result:", isAdminPassword(testPassword));

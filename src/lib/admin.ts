export function isAdminEmail(email: string | null | undefined) {
  const list = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const e = (email ?? "").trim().toLowerCase();
  return !!e && list.includes(e);
}

export function isAdminPassword(pw: string | null | undefined) {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  return !!expected && (pw ?? "") === expected;
}


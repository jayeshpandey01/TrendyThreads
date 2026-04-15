import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin";

export async function assertAdmin() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? "";
  if (!isAdminEmail(email)) {
    return { ok: false as const, session: null };
  }
  return { ok: true as const, session };
}


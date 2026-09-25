import type { User } from "firebase/auth";

/** JSON headers plus the merchant's Firebase ID token (for server-side gates). */
export async function merchantJsonHeaders(
  user: User | null | undefined,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (user) {
    try {
      headers.authorization = `Bearer ${await user.getIdToken()}`;
    } catch {
      // Unauthenticated request: server treats the store as unverified.
    }
  }
  return headers;
}

/**
 * World ID (IDKit) config for merchant storefront verification.
 *
 * Trust moment: a merchant (or their seller agent) wants a storefront listed on
 * the public /market + agent registry. One seller could spin up many accounts
 * and flood the marketplace, so listing requires proof that this account is
 * backed by a unique government document (Passport / eID / My Number Card)
 * that has not already backed another merchant account.
 */

/** IDKit action — one nullifier per human per action, scoped to our RP. */
export const WORLD_ACTION_PUBLISH_STOREFRONT = "publish-storefront";

/** Credential identifiers we accept as "unique document" proof. */
export const ACCEPTED_DOCUMENT_CREDENTIALS = new Set([
  "passport", // World ID 4.0 Passport / eID (issuer schema 9303)
  "mnc", // Japan My Number Card (issuer schema 9310)
  "secure_document", // legacy v3 fallback (NFC chip-verified document)
  "document", // legacy v3 fallback
]);

export const ACCEPTED_DOCUMENT_SCHEMA_IDS = new Set([9303, 9310]);

export type WorldEnvironment = "production" | "staging";

export function worldPublicConfig() {
  const appId = process.env.NEXT_PUBLIC_WORLD_APP_ID?.trim() || "";
  const rpId = process.env.NEXT_PUBLIC_WORLD_RP_ID?.trim() || "";
  const environment: WorldEnvironment =
    process.env.NEXT_PUBLIC_WORLD_ENV === "production" ? "production" : "staging";
  return {
    appId: appId as `app_${string}`,
    rpId,
    environment,
    action: WORLD_ACTION_PUBLISH_STOREFRONT,
    configured: Boolean(appId && rpId),
  };
}

/** Server-only: RP signing key (never expose to the client). */
export function worldRpSigningKey(): string | null {
  // Tolerate common env-paste artifacts: wrapping quotes, literal "\n", spaces.
  const raw = process.env.WORLD_RP_SIGNING_KEY || "";
  const key = raw
    .replace(/\\n/g, "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\s+/g, "");
  return key || null;
}

/**
 * Server-only: token from the Developer Portal's `set_world_id_staging_verification`
 * (valid 24h). Required for World to accept staging / Simulator proofs.
 */
export function worldStagingVerificationToken(): string | null {
  return process.env.WORLD_STAGING_VERIFICATION_TOKEN?.trim() || null;
}

export const WORLD_VERIFY_BASE_URL =
  process.env.WORLD_VERIFY_BASE_URL?.trim() ||
  "https://developer.world.org/api/v4/verify";

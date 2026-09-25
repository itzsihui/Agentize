import { bearerToken, verifyFirebaseIdToken } from "@/lib/firebase/verify-id-token";
import { isMerchantHumanVerified } from "@/lib/world/registry";

export const LISTING_NEEDS_WORLD_ID =
  "Saved as an unlisted draft: verify with World ID (Passport, eID or My Number Card) to list this storefront on /market and the agent registry.";

/**
 * Server-side listing gate. A store can only be listed when the request
 * carries a Firebase token for a merchant whose uid is bound to a World ID
 * document nullifier. Unverified publishes still save, but unlisted.
 */
export async function resolveListingGate(
  request: Request,
  body: { ownerUid?: string; listOnMarket?: boolean },
) {
  const token = bearerToken(request);
  const tokenUid = token ? (await verifyFirebaseIdToken(token))?.uid : null;
  // Prefer the token uid; the body uid is client-supplied and unverified.
  const ownerUid = tokenUid || body.ownerUid;
  const humanVerified = tokenUid ? await isMerchantHumanVerified(tokenUid) : false;
  const wantsListing = body.listOnMarket !== false;
  return {
    ownerUid,
    humanVerified,
    listOnMarket: wantsListing && humanVerified,
    blocked: wantsListing && !humanVerified,
  };
}

/** Rewrite a publish reply when listing was withheld. */
export function applyListingGateReply<
  T extends { status?: string; reply?: string },
>(result: T, blocked: boolean): T & { listingBlocked?: boolean } {
  if (!blocked || result.status !== "published") return result;
  return { ...result, reply: LISTING_NEEDS_WORLD_ID, listingBlocked: true };
}

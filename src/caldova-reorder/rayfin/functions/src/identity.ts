import type { RayfinContext } from '@microsoft/fabric-user-data-functions';

/** The regional manager who is signed in, as recorded against a reorder. */
export interface SignedInManager {
  /** Directory object id, from the token's `sub` claim. */
  id: string;
  /** User principal name, as it appears in Caldova's store directory. */
  upn: string;
}

interface SessionClaims {
  sub?: string;
  email?: string;
  preferred_username?: string;
  upn?: string;
}

/**
 * Reads the caller's identity from the session token.
 *
 * Deliberately not a parameter: who sent a reorder is decided by the signed-in
 * identity, never by the client that called the function.
 */
export function signedInManager<TSchema extends Record<string, unknown>>(
  ctx: RayfinContext<TSchema>,
): SignedInManager {
  const claims = decodeClaims(ctx.accessToken);
  const upn = claims.email ?? claims.preferred_username ?? claims.upn;

  if (!claims.sub || !upn) {
    throw new Error('The session token carries no user identity; cannot record a reorder.');
  }

  return { id: claims.sub, upn };
}

function decodeClaims(accessToken: string): SessionClaims {
  const payload = accessToken.split('.')[1];

  if (!payload) {
    throw new Error('The session token is not a JWT.');
  }

  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as SessionClaims;
}

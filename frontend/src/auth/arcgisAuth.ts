import OAuthInfo from '@arcgis/core/identity/OAuthInfo';
import esriId from '@arcgis/core/identity/IdentityManager';
import { configuration } from '../config';

/**
 * ArcGIS OAuth 2.0 sign-in gate (ADR-0003). Registers the OAuth app, then either resumes an
 * existing session or redirects the user through the org's configured SSO. The signed-in user's
 * token is what applyEdits/addAttachment use client-side.
 */
const PORTAL_URL = configuration.portalUrl.replace(/\/+$/, '');
const CLIENT_ID = configuration.arcgisClientId;
const TOKEN_SERVER = `${PORTAL_URL}/sharing`;

let registered = false;

function register(): void {
  if (registered) return;
  const info = new OAuthInfo({
    appId: CLIENT_ID,
    portalUrl: PORTAL_URL,
    popup: false, // redirect flow; the redirect URI is the app's own URL
  });
  esriId.registerOAuthInfos([info]);
  registered = true;
}

export interface SignedInUser {
  username: string;
  token: string;
}

/** Resolve the current credential, or null if not signed in. Never triggers a redirect. */
export async function getCurrentUser(): Promise<SignedInUser | null> {
  register();
  try {
    const cred = await esriId.checkSignInStatus(TOKEN_SERVER);
    return { username: cred.userId ?? '', token: cred.token };
  } catch {
    return null;
  }
}

/** Trigger sign-in (redirects through org SSO if needed). Resolves once a credential exists. */
export async function signIn(): Promise<SignedInUser> {
  register();
  const cred = await esriId.getCredential(TOKEN_SERVER);
  return { username: cred.userId ?? '', token: cred.token };
}

export function signOut(): void {
  esriId.destroyCredentials();
  window.location.reload();
}

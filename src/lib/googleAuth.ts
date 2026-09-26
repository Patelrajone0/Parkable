/**
 * Official Google Identity Services (GIS) OAuth 2.0 Integration
 */

export interface GoogleUserPayload {
  iss?: string;
  nbf?: number;
  aud?: string;
  sub: string; // Unique Google User ID
  email: string;
  email_verified?: boolean;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

const STORAGE_KEY_GOOGLE_CLIENT_ID = 'parkable_google_client_id_v1';

/**
 * Get active Google Client ID from environment or saved config
 */
export function getGoogleClientId(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY_GOOGLE_CLIENT_ID);
    if (saved && saved.trim()) return saved.trim();
  }
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
}

/**
 * Save Google Client ID locally
 */
export function saveGoogleClientId(clientId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_GOOGLE_CLIENT_ID, clientId.trim());
  }
}

/**
 * Decode Google JWT credential token returned by Google Identity Services
 */
export function decodeGoogleJwt(token: string): GoogleUserPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Failed to decode Google JWT token:', err);
    return null;
  }
}

/**
 * Launch official Google Identity Services sign-in popup
 * Uses google.accounts.oauth2.initTokenClient to open accounts.google.com/v3/signin/accountchooser popup
 */
export function triggerOfficialGoogleSignIn(
  clientId: string,
  onSuccess: (payload: GoogleUserPayload) => void,
  onError: (errorMsg: string) => void
): void {
  if (typeof window === 'undefined') return;

  if (!window.google || !window.google.accounts) {
    onError('Google Identity Services script is still loading. Please check your internet connection and try again.');
    return;
  }

  try {
    // 1. Preferred modern Google OAuth 2.0 popup: opens the exact account chooser window
    if (window.google.accounts.oauth2 && typeof window.google.accounts.oauth2.initTokenClient === 'function') {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
        prompt: 'select_account',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            onError(tokenResponse.error_description || tokenResponse.error || 'Google sign-in was cancelled or failed.');
            return;
          }

          if (!tokenResponse.access_token) {
            onError('Google did not return an access token.');
            return;
          }

          try {
            // Fetch live profile details using the returned OAuth access token
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`,
              },
            });

            if (!res.ok) {
              throw new Error(`Google userinfo request failed with status: ${res.status}`);
            }

            const data = await res.json();
            const fullName = data.name || `${data.given_name || ''} ${data.family_name || ''}`.trim() || data.email?.split('@')[0] || 'Google User';

            onSuccess({
              sub: data.sub || `google-${Date.now()}`,
              name: fullName,
              email: data.email,
              picture: data.picture,
              given_name: data.given_name,
              family_name: data.family_name,
              email_verified: data.email_verified,
            });
          } catch (fetchErr: any) {
            onError(fetchErr.message || 'Could not retrieve user profile from Google.');
          }
        },
      });

      // Launch the accounts.google.com/v3/signin/accountchooser popup
      tokenClient.requestAccessToken({ prompt: 'select_account' });
      return;
    }

    // 2. Fallback to Google ID Token initialize & prompt if oauth2 is not available
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: any) => {
        if (response && response.credential) {
          const user = decodeGoogleJwt(response.credential);
          if (user && user.email) {
            onSuccess(user);
          } else {
            onError('Could not extract user details from Google credential.');
          }
        } else {
          onError('Google sign-in did not return valid credentials.');
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed()) {
        console.warn('Google One Tap not displayed:', notification.getNotDisplayedReason());
      }
      if (notification.isSkippedMoment()) {
        console.warn('Google One Tap skipped:', notification.getSkippedReason());
      }
      if (notification.isDismissedMoment()) {
        console.warn('Google One Tap dismissed:', notification.getDismissedReason());
      }
    });
  } catch (err: any) {
    onError(err.message || 'Failed to initialize Google Sign-In.');
  }
}

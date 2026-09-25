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
 * Launch official Google Identity Services sign-in popup or prompt
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

    // Display Google One Tap / sign-in prompt
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

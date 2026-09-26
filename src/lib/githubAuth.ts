/**
 * Official GitHub OAuth 2.0 Integration
 */

const STORAGE_KEY_GITHUB_CLIENT_ID = 'parkable_github_client_id_v1';
const STORAGE_KEY_GITHUB_CLIENT_SECRET = 'parkable_github_client_secret_v1';

/**
 * Get active GitHub Client ID from environment or saved config
 */
export function getGithubClientId(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY_GITHUB_CLIENT_ID);
    if (saved && saved.trim()) return saved.trim();
  }
  return process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '';
}

/**
 * Get active GitHub Client Secret (for client-configured dev mode)
 */
export function getGithubClientSecret(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY_GITHUB_CLIENT_SECRET);
    if (saved && saved.trim()) return saved.trim();
  }
  return '';
}

/**
 * Save GitHub credentials locally
 */
export function saveGithubCredentials(clientId: string, clientSecret?: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_GITHUB_CLIENT_ID, clientId.trim());
    if (clientSecret) {
      localStorage.setItem(STORAGE_KEY_GITHUB_CLIENT_SECRET, clientSecret.trim());
    }
  }
}

/**
 * Get the official authorization callback URL for this app
 */
export function getGithubRedirectUri(): string {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    if (pathname.includes('/login')) {
      return `${origin}${pathname}`;
    }
    return `${origin}/login/`;
  }
  return 'http://localhost:3000/login/';
}

/**
 * Redirect user to official GitHub OAuth authorization page
 */
export function launchOfficialGithubOAuth(clientId: string, redirectUri?: string): void {
  if (typeof window === 'undefined') return;

  const callback = redirectUri || getGithubRedirectUri();
  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', clientId.trim());
  githubAuthUrl.searchParams.set('redirect_uri', callback);
  githubAuthUrl.searchParams.set('scope', 'read:user user:email');
  githubAuthUrl.searchParams.set('allow_signup', 'true');

  window.location.href = githubAuthUrl.toString();
}

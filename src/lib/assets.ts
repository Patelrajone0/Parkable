/**
 * Helper to resolve static asset URLs considering Next.js basePath (for GitHub Pages subpaths)
 */
export function getAssetUrl(path: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  if (!path.startsWith('/')) return path;
  return `${basePath}${path}`;
}

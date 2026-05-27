/** Resolve a public/ file to an absolute URL (works with GitHub Pages base paths). */
export function publicAssetUrl(filename: string): string {
  return new URL(filename, new URL(import.meta.env.BASE_URL, window.location.href)).href
}

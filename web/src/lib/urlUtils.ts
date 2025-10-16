/**
 * URL detection and normalization utilities
 */

// Pattern to match domain.tld format: example.com, www.example.com, subdomain.example.com
// Supports ports and paths: example.com:8080, example.com/path?query=1
const URL_PATTERN = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:[0-9]+)?(\/.*)?$/;

/**
 * Checks if a string is a valid URL
 * Recognizes:
 * - URLs with explicit protocols (http://, https://, ftp://)
 * - Domain patterns without protocols (example.com, www.example.com)
 * - Localhost with port (localhost:3000)
 * 
 * @param text - The string to check
 * @returns true if the string is a valid URL
 */
export function isUrl(text: string): boolean {
  if (!text || !text.trim()) {
    return false;
  }

  const trimmed = text.trim();

  // Check if it has a protocol
  if (trimmed.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//)) {
    try {
      new URL(trimmed);
      return true;
    } catch {
      return false;
    }
  }

  // Check for localhost with port
  if (trimmed.match(/^localhost(:[0-9]+)?(\/.*)?$/)) {
    return true;
  }

  // Check for domain pattern (example.com, www.example.com, etc.)
  return URL_PATTERN.test(trimmed);
}

/**
 * Normalizes a URL by adding https:// protocol if missing
 * 
 * @param url - The URL string to normalize
 * @returns The normalized URL with protocol
 */
export function normalizeUrl(url: string): string {
  if (!url || !url.trim()) {
    return url;
  }

  const trimmed = url.trim();

  // If it already has a protocol, return as-is
  if (trimmed.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//)) {
    return trimmed;
  }

  // For localhost, add http:// (not https://)
  if (trimmed.match(/^localhost(:[0-9]+)?(\/.*)?$/)) {
    return `http://${trimmed}`;
  }

  // For everything else, add https://
  return `https://${trimmed}`;
}



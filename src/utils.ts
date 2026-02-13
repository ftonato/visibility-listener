/**
 * Cache for the vendor prefix to avoid redundant DOM checks
 */
let cachedPrefix: string | null = null;

/**
 * Finds the vendor prefix for the Page Visibility API.
 * The result is cached globally since the prefix is the same for all documents in a browser.
 * 
 * @param d - The document object to check
 * @returns The vendor prefix (e.g., 'webkit', 'moz') or empty string if no prefix needed
 */
function findPrefix(d: Document): string {
  // Return cached value if available
  if (cachedPrefix !== null) {
    return cachedPrefix;
  }

  const availablePrefixes: string[] = ['webkit', 'ms', 'o', 'moz', 'khtml'];
  const prefix = availablePrefixes.find(p => p + 'Hidden' in d) ?? '';
  
  // Cache the result for future calls
  cachedPrefix = prefix;
  
  return prefix;
}

/**
 * Resets the cached prefix. This is primarily for testing purposes.
 * @internal
 */
function resetPrefixCache(): void {
  cachedPrefix = null;
}

export {findPrefix, resetPrefixCache};

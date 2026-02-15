declare const __BACKEND_URL__: string;

/**
 * BackendService
 * Centralizes the base URL for production and development.
 */
export const BACKEND_URL = typeof __BACKEND_URL__ !== 'undefined' && __BACKEND_URL__
    ? __BACKEND_URL__
    : ''; // Relative paths by default (Netlify Rewrites)

export async function fetchWithBase(path: string, options?: RequestInit) {
    const url = path.startsWith('http') ? path : `${BACKEND_URL}${path}`;
    return options ? fetch(url, options) : fetch(url);
}

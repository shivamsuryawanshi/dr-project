/**
 * Mobile Scroll Helper Utility for MedExJob
 *
 * Ensures:
 * 1. Global manual scroll restoration (disables browser automatic jump)
 * 2. Route transitions and detail page mounts always reset instantly to (0, 0)
 * 3. Back-navigation scroll restorations happen silently and instantly with behavior: 'instant'
 */

export function enableManualScrollRestoration(): void {
  if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
    try {
      window.history.scrollRestoration = 'manual';
    } catch {
      // Ignore in restrictive webviews
    }
  }
}

export function scrollToTopInstant(): void {
  if (typeof window === 'undefined') return;

  try {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  } catch {
    try {
      window.scrollTo(0, 0);
    } catch {
      // Ignore
    }
  }

  try {
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
    const root = document.getElementById('root');
    if (root) {
      root.scrollTop = 0;
    }
    const main = document.querySelector('main');
    if (main) {
      main.scrollTop = 0;
    }
  } catch {
    // Ignore
  }
}

export function isListingPath(pathname: string): boolean {
  const clean = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  return clean === '/' || clean === '/home' || clean === '/jobs' || clean === '/govt-jobs' || clean === '/private-jobs';
}

/**
 * Navigation Scroll Tracker & Manager
 * Captures, manages, and restores vertical/horizontal scroll positions across views
 */

// Memory cache of screen scroll positions
const scrollPositionCache: Record<string, Record<string, number>> = {};

/**
 * Initializes passive scroll event listeners to track scrollable containers.
 */
export function initNavigationScrollTracker(): () => void {
  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (!target || !(target instanceof HTMLElement)) return;

    const scrollId = target.id || target.getAttribute('data-scroll-container');
    if (scrollId) {
      if (!scrollPositionCache['current']) {
        scrollPositionCache['current'] = {};
      }
      scrollPositionCache['current'][scrollId] = target.scrollTop;
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', handleScroll, true);
    }
  };
}

/**
 * Captures scroll positions of all active scrollable containers for a given screen.
 */
export function captureScreenScroll(screenKey: string): Record<string, number> {
  const result: Record<string, number> = { ...(scrollPositionCache['current'] || {}) };

  if (typeof document !== 'undefined') {
    const scrollContainers = document.querySelectorAll<HTMLElement>(
      '[data-scroll-container], [id*="scroll"], main, [role="main"]'
    );
    scrollContainers.forEach((container) => {
      const key = container.id || container.getAttribute('data-scroll-container');
      if (key && container.scrollTop > 0) {
        result[key] = container.scrollTop;
      }
    });

    if (window.scrollY > 0) {
      result['window'] = window.scrollY;
    }
  }

  scrollPositionCache[screenKey] = result;
  return result;
}

/**
 * Restores scroll positions for a given screen.
 */
export function restoreScreenScroll(
  scrollPositions?: Record<string, number>,
  screenKey?: string
): void {
  if (typeof window === 'undefined') return;

  const positions = scrollPositions || (screenKey ? scrollPositionCache[screenKey] : null);
  if (!positions) return;

  requestAnimationFrame(() => {
    for (const [key, val] of Object.entries(positions)) {
      if (key === 'window') {
        window.scrollTo({ top: val, behavior: 'instant' as any });
        continue;
      }

      const element = document.getElementById(key) || document.querySelector(`[data-scroll-container="${key}"]`);
      if (element && element instanceof HTMLElement) {
        element.scrollTop = val;
      }
    }
  });
}

/**
 * Clears current live scroll position cache.
 */
export function clearLiveScrollPositions(): void {
  scrollPositionCache['current'] = {};
}

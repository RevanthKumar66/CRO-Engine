'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to monitor viewport media queries.
 * Useful for switching between layouts (e.g. desktop popover vs mobile drawer).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

export default useMediaQuery;

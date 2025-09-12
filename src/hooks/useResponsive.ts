'use client';

import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768; // Standard mobile breakpoint

/**
 * A custom hook to detect if the current screen width is for a mobile device.
 * @returns {object} An object containing a boolean `isMobile`.
 */
export function useResponsive() {
  // Initialize state to a default value, will be corrected on client-side mount.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // This code only runs on the client.
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Check on initial mount
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return { isMobile };
}

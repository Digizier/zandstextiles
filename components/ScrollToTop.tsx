"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Ensures that every page transition immediately scrolls to the top of the page (0, 0),
 * resolving the bug where pages opened at the bottom or middle of the screen.
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}

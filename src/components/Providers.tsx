"use client";

import { MotionConfig } from "framer-motion";

/** Motion honours the user's "reduce motion" setting everywhere. */
export function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

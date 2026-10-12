'use client';

import { motion, useReducedMotion } from 'framer-motion';

/** Three dashed rings turning slowly behind the product in the benefits orbit. */
export function RotatingOrbit() {
  const reduce = useReducedMotion();
  const spin = (deg: number, duration: number) =>
    reduce ? {} : { animate: { rotate: deg }, transition: { duration, repeat: Infinity, ease: 'linear' as const } };

  return (
    <>
      <motion.div
        aria-hidden
        className="absolute inset-[2%] rounded-full border border-dashed border-primary/10"
        {...spin(-360, 45)}
      />
      <motion.div
        aria-hidden
        className="absolute inset-[12%] rounded-full border-2 border-dashed border-brand-accent/25"
        {...spin(360, 35)}
      />
      <motion.div
        aria-hidden
        className="absolute inset-[22%] rounded-full border-4 border-dashed border-primary/25"
        {...spin(-360, 40)}
      />
    </>
  );
}

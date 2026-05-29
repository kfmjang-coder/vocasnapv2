import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function Page({ children, pad = true }: { children: ReactNode; pad?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`mx-auto min-h-full w-full max-w-[440px] ${pad ? 'px-5' : ''}`}
      style={{ paddingTop: 'calc(var(--safe-top) + 16px)' }}
    >
      {children}
    </motion.div>
  );
}

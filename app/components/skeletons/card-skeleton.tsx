'use client';

import { motion } from 'framer-motion';

export function CardSkeletonSm() {
  return (
    <motion.div
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      className="rounded-card-sm border-2 border-slate-200 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 p-lg h-48"
    />
  );
}

export function CardSkeletonMd() {
  return (
    <motion.div
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      className="rounded-card-lg border-2 border-slate-200 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 p-lg h-56"
    />
  );
}

export function CardSkeletonLg() {
  return (
    <motion.div
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      className="rounded-card-xl border-2 border-slate-200 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 p-lg h-64"
    />
  );
}

export function VoteCardSkeleton() {
  return (
    <motion.div
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      className="rounded-card-lg border-2 border-slate-200 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 p-lg h-48"
    />
  );
}

export function EventCardSkeleton() {
  return (
    <motion.div
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      className="rounded-card-xl border-2 border-slate-200 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 p-lg h-64"
    />
  );
}

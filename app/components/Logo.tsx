import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
     <path d="M20 4L4 20L20 36L36 20L20 4Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
     <path d="M20 12L12 20L20 28L28 20L20 12Z" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

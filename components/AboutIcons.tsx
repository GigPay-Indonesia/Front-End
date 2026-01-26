import React from 'react';

export const IconTreasury = ({ className = "w-12 h-12" }: { className?: string }) => (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M4 44H44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 36V28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-blue-500" />
        <path d="M16 36V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-indigo-400" />
        <path d="M24 36V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-blue-400" />
        <path d="M32 36V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-blue-400" />
        <path d="M40 36V24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-blue-300" />
        <circle cx="24" cy="12" r="3" fill="currentColor" className="text-white animate-pulse" />
        <path d="M8 28L16 20L24 12L32 18L40 24" stroke="white" strokeWidth="1.5" strokeDasharray="2 2" />
    </svg>
);

export const IconEscrow = ({ className = "w-12 h-12" }: { className?: string }) => (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M24 4L6 12V22C6 33 14 42 24 46C34 42 42 33 42 22V12L24 4Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" />
        <path d="M24 16V26" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <rect x="18" y="26" width="12" height="10" rx="2" fill="currentColor" className="text-blue-500" />
        <circle cx="24" cy="31" r="2" fill="white" />
        <path d="M34 16L38 20" stroke="currentColor" strokeWidth="2" className="text-blue-400" />
        <path d="M14 16L10 20" stroke="currentColor" strokeWidth="2" className="text-blue-400" />
    </svg>
);

export const IconIncentives = ({ className = "w-12 h-12" }: { className?: string }) => (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M4 24C4 35.0457 12.9543 44 24 44C35.0457 44 44 35.0457 44 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-slate-600" />
        <path d="M24 10V24L34 34" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <circle cx="24" cy="24" r="4" fill="currentColor" className="text-blue-500" />
        <path d="M38 10L42 6M6 10L10 14" stroke="currentColor" strokeWidth="2" className="text-blue-500" />
        <circle cx="42" cy="6" r="2" fill="white" />
        <circle cx="6" cy="10" r="2" fill="white" />
    </svg>
);

export const IconTrustless = ({ className = "w-12 h-12" }: { className?: string }) => (
    <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="8" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="2" className="text-slate-400" />
        <path d="M16 20L22 24L16 28" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M26 32H32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-blue-500" />
        <rect x="26" y="16" width="2" height="2" fill="currentColor" className="text-blue-400" />
        <rect x="30" y="16" width="2" height="2" fill="currentColor" className="text-blue-400" />
    </svg>
);

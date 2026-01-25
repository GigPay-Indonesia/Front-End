import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { TokenLogo } from './TokenLogo';
import { motion, AnimatePresence } from 'framer-motion';

interface TokenDropdownProps {
    options: string[];
    selected: string;
    onChange: (token: string) => void;
    label?: string;
}

export const TokenDropdown: React.FC<TokenDropdownProps> = ({ options, selected, onChange, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {label && (
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {label}
                </label>
            )}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-[#0f172a]/50 hover:bg-[#0f172a]/70 border border-slate-700 hover:border-slate-600 rounded-xl px-4 py-3 text-white transition-all group"
            >
                <div className="flex items-center gap-3">
                    <TokenLogo currency={selected} size={24} />
                    <span className="font-bold font-mono">{selected}</span>
                </div>
                <ChevronDown
                    size={16}
                    className={`text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute z-50 w-full mt-2 bg-[#0a0a0a] border border-slate-800 rounded-xl shadow-2xl overflow-hidden py-1"
                    >
                        {options.map((option) => (
                            <button
                                key={option}
                                onClick={() => {
                                    onChange(option);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-900 transition-colors ${selected === option ? 'bg-primary/10 text-primary' : 'text-slate-300'
                                    }`}
                            >
                                <TokenLogo currency={option} size={20} />
                                <span className={`font-mono text-sm ${selected === option ? 'font-bold' : 'font-medium'}`}>
                                    {option}
                                </span>
                                {selected === option && (
                                    <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion';
import { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { Home, Search, Zap, Layers, Settings, Globe } from 'lucide-react';

// --- Types ---
export interface DockItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    href: string;
}

interface DockProps {
    items: DockItem[];
    className?: string;
}

// --- Dock Icon Component ---
const DockIcon = ({
    mouseX,
    item,
    isActive
}: {
    mouseX: MotionValue<number>;
    item: DockItem;
    isActive: boolean;
}) => {
    const ref = useRef<HTMLDivElement>(null);

    const distance = useTransform(mouseX, (val) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    const widthSync = useTransform(distance, [-150, 0, 150], [40, 55, 40]);
    const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

    return (
        <Link to={item.href}>
            <motion.div
                ref={ref}
                style={{ width }}
                className={cn(
                    "aspect-square rounded-full flex items-center justify-center relative transition-colors duration-200",
                    isActive
                        ? "bg-primary/20 border border-primary/50 text-white shadow-[0_0_15px_rgba(0,82,255,0.4)]"
                        : "bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white"
                )}
            >
                <div className="w-5 h-5 flex items-center justify-center">
                    {item.icon}
                </div>
                {isActive && (
                    <div className="absolute -bottom-2 w-1 h-1 rounded-full bg-primary shadow-[0_0_5px_#0052FF]" />
                )}
            </motion.div>
        </Link>
    );
};

// --- Main Dock Component ---
export const Dock = ({ items, className }: DockProps) => {
    const mouseX = useMotionValue(Infinity);
    const location = useLocation();

    return (
        <motion.div
            onMouseMove={(e) => mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Infinity)}
            className={cn(
                "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex h-16 items-end gap-4 rounded-2xl border border-white/10 bg-black/60 px-4 pb-3 backdrop-blur-md shadow-2xl md:hidden",
                className
            )}
        >
            {items.map((item) => (
                <DockIcon
                    key={item.id}
                    mouseX={mouseX}
                    item={item}
                    isActive={location.pathname === item.href}
                />
            ))}
        </motion.div>
    );
};

// --- Default Items for GigPay ---
export const defaultDockItems: DockItem[] = [
    { id: 'overview', label: 'Overview', icon: <Home size={20} />, href: '/overview' },
    { id: 'treasury', label: 'Treasury', icon: <Layers size={20} />, href: '/treasury' },
    { id: 'create', label: 'Pay', icon: <Zap size={20} fill="currentColor" />, href: '/payments/new' },
    { id: 'explore', label: 'Explore', icon: <Globe size={20} />, href: '/explore' },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} />, href: '/settings' },
];

import React from 'react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

interface Step {
    id: number;
    label: string;
}

interface StepperProps {
    steps: Step[];
    currentStep: number;
    onStepClick?: (stepIndex: number) => void;
}

export default function ReactBitsStepper({ steps, currentStep, onStepClick }: StepperProps) {
    return (
        <div className="flex w-full flex-col gap-4">
            <div className="relative flex w-full flex-row items-center justify-between rounded-2xl bg-zinc-900/80 p-2 backdrop-blur-sm border border-white/5">
                {steps.map((step, index) => {
                    const isActive = index === currentStep;
                    const isCompleted = index < currentStep;

                    return (
                        <div
                            key={step.id}
                            onClick={() => onStepClick && onStepClick(index)}
                            className={cn(
                                "relative z-10 flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-colors duration-200",
                                isActive ? "text-black" : isCompleted ? "text-primary" : "text-zinc-500"
                            )}
                        >
                            {/* Animated Background for Active Step */}
                            {isActive && (
                                <motion.div
                                    layoutId="active-step-bg"
                                    className="absolute inset-0 rounded-xl bg-primary"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}

                            {/* Step Number/Icon */}
                            <span className={cn("relative z-20 flex h-6 w-6 items-center justify-center rounded-full text-xs",
                                isActive ? "bg-black text-primary" : isCompleted ? "bg-primary/20 text-primary border border-primary/50" : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                            )}>
                                {isCompleted ? "✓" : step.id}
                            </span>

                            {/* Step Label */}
                            <span className="relative z-20 hidden sm:block">{step.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* Progress Bar Line (Optional visual flair) */}
            <div className="h-1 w-full rounded-full bg-zinc-800 mt-2 overflow-hidden">
                <motion.div
                    className="h-full bg-primary shadow-[0_0_10px_rgba(0,82,255,0.5)]"
                    initial={{ width: "0%" }}
                    animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    transition={{ type: "spring", stiffness: 100 }}
                />
            </div>
        </div>
    );
}

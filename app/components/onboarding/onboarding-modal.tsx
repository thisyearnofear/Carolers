'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import {
    Plus,
    Users,
    Sparkles,
    Music,
    Heart,
    Calendar,
    Snowflake,
    X,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const ONBOARDING_KEY = 'carolers_onboarding_complete_v2';

export function OnboardingModal({ onClose }: { onClose: () => void }) {
    const [step, setStep] = useState(1);
    const [isVisible, setIsVisible] = useState(true);
    const router = useRouter();

    const totalSteps = 4;

    const steps = [
        {
            title: "Prepare for the Magic",
            description: "Browse carols, explore themes, and find your vocal range before you even start singing.",
            icon: <Music className="w-12 h-12 text-primary" />,
            image: "🎄",
            color: "from-red-50 to-red-100"
        },
        {
            title: "Sync with Others",
            description: "Join a session nearby or start your own. Everyone stays on the same verse, in real-time.",
            icon: <Users className="w-12 h-12 text-secondary" />,
            image: "👥",
            color: "from-green-50 to-green-100"
        },
        {
            title: "Vote & Sing Along",
            description: "Democratically choose carols and access synchronized lyrics optimized for mobile and outdoors.",
            icon: <Sparkles className="w-12 h-12 text-accent" />,
            image: "🎶",
            color: "from-yellow-50 to-yellow-100"
        },
        {
            title: "Remember the Joy",
            description: "After the session, look back at your top songs and shared memories to plan the next one.",
            icon: <Calendar className="w-12 h-12 text-primary" />,
            image: "🎉",
            color: "from-primary/10 to-accent/10"
        },
    ];

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            completeOnboarding();
        }
    };

    const completeOnboarding = () => {
        localStorage.setItem(ONBOARDING_KEY, 'true');
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const handleSkip = () => {
        completeOnboarding();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4 z-[100]">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
                <Card className="w-full max-w-3xl border-none shadow-2xl overflow-hidden rounded-[2rem] bg-white">
                    <button
                        onClick={handleSkip}
                        className="absolute top-6 right-6 z-20 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Skip onboarding"
                    >
                        <X className="w-6 h-6 text-gray-400" />
                    </button>

                    <div className="flex flex-col md:flex-row min-h-[400px]">
                        {/* Illustration side */}
                        <div className={`flex-1 p-12 bg-gradient-to-br ${steps[step - 1].color} flex flex-col items-center justify-center relative overflow-hidden`}>
                            <motion.div
                                key={`icon-${step}`}
                                initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="relative z-10"
                            >
                                <div className="w-32 h-32 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6">
                                    {steps[step - 1].icon}
                                </div>
                            </motion.div>
                            <div className="text-sm font-bold text-primary tracking-widest uppercase relative z-10">
                                Step {step} of {totalSteps}
                            </div>

                            {/* Background Decoration */}
                            <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
                                <div className="absolute top-10 left-10 text-4xl">❄️</div>
                                <div className="absolute bottom-10 right-10 text-4xl">🎵</div>
                                <div className="absolute top-1/2 right-4 text-2xl">✨</div>
                            </div>
                        </div>

                        {/* Content side */}
                        <div className="flex-1 p-12 flex flex-col justify-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="text-4xl mb-4">{steps[step - 1].image}</div>
                                    <h2 className="text-3xl font-display text-primary mb-4 leading-tight">
                                        {steps[step - 1].title}
                                    </h2>
                                    <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                        {steps[step - 1].description}
                                    </p>
                                </motion.div>
                            </AnimatePresence>

                            <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-1.5">
                                    {Array.from({ length: totalSteps }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-1 transition-all duration-300 rounded-full ${i + 1 <= step ? 'w-6 bg-primary' : 'w-1.5 bg-slate-200'
                                                }`}
                                        />
                                    ))}
                                </div>

                                <Button
                                    onClick={handleNext}
                                    className={`gap-2 h-12 px-6 rounded-xl shadow-lg transition-all ${step === totalSteps ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary/90'
                                        }`}
                                >
                                    {step < totalSteps ? 'Next' : 'Get Singing!'}
                                    <ArrowRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}

export function useOnboarding() {
    const [shouldShow, setShouldShow] = useState(false);

    useEffect(() => {
        const hasCompleted = localStorage.getItem(ONBOARDING_KEY) === 'true';
        setShouldShow(!hasCompleted);
    }, []);

    return {
        shouldShow,
        completeOnboarding: () => {
            localStorage.setItem(ONBOARDING_KEY, 'true');
            setShouldShow(false);
        }
    };
}

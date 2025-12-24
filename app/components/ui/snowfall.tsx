'use client';

import { motion } from 'framer-motion';
import { Snowflake } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Snowfall() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-[100] opacity-30 dark:opacity-10">
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute text-primary"
                    initial={{
                        y: -20,
                        x: `${Math.random() * 100}%`,
                        scale: 0.5 + Math.random(),
                        rotate: 0,
                        opacity: 0.2 + Math.random() * 0.5
                    }}
                    animate={{
                        y: '110vh',
                        x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                        rotate: 360,
                    }}
                    transition={{
                        duration: 15 + Math.random() * 20,
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 20
                    }}
                >
                    <Snowflake size={12 + Math.random() * 24} />
                </motion.div>
            ))}
        </div>
    );
}

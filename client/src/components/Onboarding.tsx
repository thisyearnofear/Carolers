// MODULAR: First-time user onboarding system
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { X, Music, Users, Calendar, Check, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// CLEAN: Onboarding storage
const ONBOARDING_KEY = 'carolers_onboarding_complete';

export function OnboardingModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  const totalSteps = 4;

  // ENHANCEMENT FIRST: Onboarding steps
  const steps = [
    {
      title: "Welcome to Carolers! 🎄🎵",
      description: "Gather your friends and family to celebrate the season with song.",
      icon: <Music className="w-12 h-12 text-primary" />,
      image: "🎄",
    },
    {
      title: "Create or Join Events",
      description: "Start your own caroling gathering or join existing celebrations in your community.",
      icon: <Calendar className="w-12 h-12 text-primary" />,
      image: "📅",
    },
    {
      title: "Vote on Favorite Songs",
      description: "Democratically choose the carols your group will sing together.",
      icon: <Users className="w-12 h-12 text-primary" />,
      image: "🎶",
    },
    {
      title: "Celebrate Together!",
      description: "Enjoy the magic of group singing with all the coordination handled.",
      icon: <Check className="w-12 h-12 text-primary" />,
      image: "🎉",
    },
  ];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      completeOnboarding();
      navigate('/'); // Go to home to choose action
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsVisible(false);
    setTimeout(onClose, 300); // Allow fade-out animation
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl mx-auto relative overflow-hidden">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Skip onboarding"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Left side - Content */}
          <div className="flex-1 p-8 md:p-12">
            <div className="mb-6">
              <div className="text-6xl mb-4">{steps[step - 1].image}</div>
              <h2 className="text-2xl font-bold text-primary mb-2">
                {steps[step - 1].title}
              </h2>
              <p className="text-gray-600 mb-6">
                {steps[step - 1].description}
              </p>
            </div>

            <div className="flex items-center justify-between mt-8">
              <div className="flex items-center gap-2">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <motion.div
                    key={i}
                    className={`w-2 h-2 rounded-full ${i + 1 <= step ? 'bg-primary' : 'bg-gray-300'}`}
                    initial={{ scale: 1 }}
                    animate={{ scale: i + 1 === step ? 1.2 : 1 }}
                    transition={{ duration: 0.2 }}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                {step < totalSteps ? (
                  <Button onClick={handleNext} className="gap-2 bg-primary hover:bg-primary/90">
                    Next <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="gap-2 bg-green-600 hover:bg-green-700">
                    Get Started! <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Illustration */}
          <div className="flex-1 p-8 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            <div className="text-center">
              {steps[step - 1].icon}
              <p className="mt-4 text-primary font-semibold">
                Step {step} of {totalSteps}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// MODULAR: Onboarding provider
export function useOnboarding() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const hasCompleted = localStorage.getItem(ONBOARDING_KEY) === 'true';
    setShouldShow(!hasCompleted);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShouldShow(false);
  };

  return {
    shouldShow,
    completeOnboarding,
  };
}

// CLEAN: Onboarding wrapper component
export function OnboardingWrapper({ children }: { children: React.ReactNode }) {
  const { shouldShow } = useOnboarding();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (shouldShow) {
      const timer = setTimeout(() => setShowModal(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldShow]);

  if (!showModal) return <>{children}</>;

  return (
    <>
      {children}
      <OnboardingModal onClose={() => setShowModal(false)} />
    </>
  );
}
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PawPrint, Heart, Home, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const slides = [
  {
    id: 0,
    icon: <PawPrint size={56} strokeWidth={1.5} />,
    emoji: '🐾',
    bgGradient: 'from-[#ff8c42] via-[#ffa96b] to-[#ffd3b0]',
    accentColor: '#9b4500',
    title: '为每只流浪动物\n找到温暖的家',
    subtitle: '加入 PawsAdopt，数千只可爱的毛孩子正等待着你的爱与陪伴。',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800',
    imageAlt: '一只可爱的小狗',
  },
  {
    id: 1,
    icon: <Heart size={56} strokeWidth={1.5} />,
    emoji: '❤️',
    bgGradient: 'from-[#126c40] via-[#1f9e5c] to-[#a1f5bc]',
    accentColor: '#0a4a2a',
    title: '简单三步\n完成领养申请',
    subtitle: '浏览宠物 → 提交申请 → 接回家。我们让领养过程简单、透明、充满爱。',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800',
    imageAlt: '幸福的狗狗',
  },
  {
    id: 2,
    icon: <Home size={56} strokeWidth={1.5} />,
    emoji: '🏠',
    bgGradient: 'from-[#895026] via-[#b87040] to-[#e29a69]',
    accentColor: '#5c3418',
    title: '专业团队\n全程陪伴支持',
    subtitle: '从预审到接回家，我们的专属顾问将全程为你和新家庭成员提供支持。',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
    imageAlt: '温馨的猫咪',
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  const slide = slides[currentSlide];
  const isLast = currentSlide === slides.length - 1;

  const goToNext = () => {
    if (isLast) {
      onComplete();
      return;
    }
    setDirection(1);
    setCurrentSlide((prev) => prev + 1);
  };

  const goToSlide = (idx: number) => {
    setDirection(idx > currentSlide ? 1 : -1);
    setCurrentSlide(idx);
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative bg-background">
      {/* Skip button */}
      <div className="absolute top-0 left-0 right-0 z-50 flex justify-end px-6 pt-safe-top pt-12">
        <button
          onClick={onComplete}
          className="text-white/80 text-sm font-semibold px-4 py-2 rounded-full bg-black/10 backdrop-blur-md hover:bg-black/20 transition-all"
        >
          跳过
        </button>
      </div>

      {/* Animated background gradient */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${currentSlide}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className={cn('absolute inset-0 bg-gradient-to-br', slide.bgGradient)}
        />
      </AnimatePresence>

      {/* Decorative circles */}
      <div className="absolute top-[-10%] right-[-15%] w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[30%] left-[-10%] w-56 h-56 rounded-full bg-white/10 blur-3xl pointer-events-none" />

      {/* Image area */}
      <div className="relative flex-1 flex items-center justify-center px-8 pt-20 pb-4">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`img-${currentSlide}`}
            custom={direction}
            initial={{ opacity: 0, x: direction * 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction * -80, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-[320px] aspect-square"
          >
            {/* Glowing ring */}
            <div className="absolute inset-0 rounded-[40px] bg-white/20 blur-xl scale-95" />
            <div className="relative w-full h-full rounded-[40px] overflow-hidden shadow-2xl border-4 border-white/30">
              <img
                src={slide.image}
                alt={slide.imageAlt}
                className="w-full h-full object-cover"
              />
              {/* Overlay with icon */}
              <div className="absolute bottom-4 right-4 w-14 h-14 rounded-2xl bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg">
                <span className="text-2xl">{slide.emoji}</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom card */}
      <div className="relative z-10">
        <div className="bg-white rounded-t-[40px] px-8 pt-8 pb-10 shadow-2xl">
          {/* Dots */}
          <div className="flex justify-center gap-2 mb-6">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  i === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-outline-variant'
                )}
              />
            ))}
          </div>

          {/* Text */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${currentSlide}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="text-center space-y-3 mb-8"
            >
              <h2 className="text-2xl font-bold text-on-surface leading-tight whitespace-pre-line">
                {slide.title}
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {slide.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* CTA Button */}
          <button
            onClick={goToNext}
            className="w-full h-14 rounded-full bg-primary text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95 transition-all"
          >
            {isLast ? (
              <>
                <Sparkles size={20} />
                开始领养之旅
              </>
            ) : (
              <>
                下一步
                <ChevronRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingScreen;

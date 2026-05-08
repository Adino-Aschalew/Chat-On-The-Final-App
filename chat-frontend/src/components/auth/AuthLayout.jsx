import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { ChatCircleText } from '@phosphor-icons/react';

import GridBackground from '../landing/GridBackground';

const Particle = ({ delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0, 0.5, 0], 
      scale: [0, 1, 0],
      y: [-20, -100],
      x: Math.random() * 40 - 20
    }}
    transition={{ 
      duration: 3 + Math.random() * 2, 
      repeat: Infinity, 
      delay 
    }}
    className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
  />
);

const BackgroundBlobs = ({ mouseX, mouseY }) => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-transparent">
      {/* Subtle Background Accent */}
      <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-tg-primary/5 rounded-full filter blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] bg-tg-primary/10 rounded-full filter blur-[120px]"></div>
      
      {/* Interactive Lens Glow */}
      <motion.div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          background: `radial-gradient(1000px circle at ${mouseX}px ${mouseY}px, rgba(51, 144, 236, 0.1), transparent 80%)`,
        }}
      />
    </div>
  );
};

const AuthLayout = ({ title, subtitle, children, linkText, linkTo }) => {
  const cardRef = useRef(null);
  const [mPos, setMPos] = useState({ x: 0, y: 0 });
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);

  useEffect(() => {
    const handleMouseMoveGlobal = (e) => {
      setMPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMoveGlobal);
    return () => window.removeEventListener('mousemove', handleMouseMoveGlobal);
  }, []);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) - 0.5;
    const yPct = ((e.clientY - rect.top) / rect.height) - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-['Inter'] selection:bg-indigo-500/30 bg-tg-bg">
      <GridBackground />
      <BackgroundBlobs mouseX={mPos.x} mouseY={mPos.y} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={linkTo}
          initial={{ opacity: 0, scale: 0.85, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: -40 }}
          transition={{ 
            type: "spring",
            stiffness: 120,
            damping: 18
          }}
          className="w-full max-w-[34rem] z-10"
          style={{ perspective: "2000px" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div
            ref={cardRef}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="group relative"
          >
            {/* Subtle Glow Border */}
            <div className="absolute -inset-1 bg-tg-primary/10 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <div className="absolute -inset-[1px] bg-tg-border rounded-[3rem]"></div>
            
            {/* Main Premium Card */}
            <div className="bg-tg-bg rounded-[3rem] p-12 md:p-16 shadow-2xl border border-tg-border relative overflow-hidden flex flex-col items-center">
              
              {/* Dynamic Inner Glow */}
              <div 
                className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                  background: `radial-gradient(500px circle at ${mPos.x - (cardRef.current?.getBoundingClientRect().left || 0)}px ${mPos.y - (cardRef.current?.getBoundingClientRect().top || 0)}px, rgba(255, 255, 255, 0.06), transparent 80%)`,
                }}
              />

              <motion.div 
                style={{ transform: "translateZ(100px)" }}
                className="mb-10 flex flex-col items-center text-center"
              >
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  className="w-20 h-20 rounded-2xl bg-tg-primary-gradient flex items-center justify-center p-4 shadow-xl shadow-tg-primary/20 mb-6"
                >
                  <ChatCircleText size={40} weight="fill" className="text-white" />
                </motion.div>
                
                <h1 className="text-3xl font-bold text-tg-text mb-3 tracking-tight">
                  {title}
                </h1>
                <p className="text-tg-secondary text-lg font-medium max-w-[24rem]">
                  {subtitle}
                </p>
              </motion.div>

              <motion.div
                style={{ transform: "translateZ(60px)" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 1 }}
                className="w-full"
              >
                {children}
              </motion.div>

              {linkText && linkTo && (
                <motion.div 
                  style={{ transform: "translateZ(40px)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-16 w-full text-center"
                >
                  <Link 
                    to={linkTo} 
                    className="group/link inline-flex flex-col items-center gap-2"
                  >
                    <span className="text-tg-secondary text-base font-medium transition-colors group-hover/link:text-tg-text">
                      {linkText.split('?')[0]}?
                    </span>
                    <span className="text-lg font-bold text-tg-primary group-hover/link:text-tg-primary/80 transition-all duration-300">
                      {linkText.split('?')[1] || linkText}
                    </span>
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AuthLayout;

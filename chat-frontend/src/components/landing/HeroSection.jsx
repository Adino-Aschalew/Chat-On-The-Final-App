import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChatCircleText, Lightning, Users, Shield, ArrowRight, Sparkle } from '@phosphor-icons/react';
import Button from '../ui/Button';

const phrases = ['Real-time Messaging', 'Group Chats', 'File Sharing', 'Secure & Private'];

const HeroSection = () => {
  const [typedText, setTypedText] = useState('');
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    let timeout;
    const currentPhrase = phrases[currentPhraseIndex];
    let charIndex = 0;

    const type = () => {
      if (charIndex < currentPhrase.length) {
        setTypedText(currentPhrase.slice(0, charIndex + 1));
        charIndex++;
        timeout = setTimeout(type, 100);
      } else {
        timeout = setTimeout(() => {
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
          setTypedText('');
        }, 2000);
      }
    };

    type();
    return () => clearTimeout(timeout);
  }, [currentPhraseIndex]);

  const features = [
    { icon: ChatCircleText, title: 'Real-time Messaging', desc: 'Instant messaging with Socket.IO' },
    { icon: Users, title: 'Group Chats', desc: 'Create private, group, or channel chats' },
    { icon: Lightning, title: 'Fast & Secure', desc: 'JWT authentication with bcrypt' },
    { icon: Shield, title: 'Admin Dashboard', desc: 'Complete user management system' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-transparent">
      {/* Subtle Glow over Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-tg-bg/50 to-tg-bg"></div>
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-tg-primary/10 border border-tg-primary/30 rounded-full mb-6"
            >
              <Sparkle size={16} className="text-tg-primary" />
              <span className="text-sm font-medium text-tg-primary">New Features Available</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold text-tg-text mb-6 leading-tight"
            >
              Chat App
              <br />
              <span className="text-tg-primary">
                Reimagined
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-tg-secondary mb-8 max-w-2xl mx-auto lg:mx-0 text-center lg:text-left"
            >
              Experience <span className="text-tg-primary font-semibold">{typedText}</span>
              <span className="animate-pulse ml-1 text-tg-primary">|</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
            >
              <Link to="/register" className="flex-1 sm:flex-none">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <button className="btn-tg w-full sm:w-auto relative overflow-hidden group py-4 px-8 text-lg">
                    <span className="relative z-10 flex items-center gap-2">
                      Get Started Free
                      <ArrowRight size={20} />
                    </span>
                  </button>
                </motion.div>
              </Link>
              <Link to="/login" className="flex-1 sm:flex-none">
                <button className="w-full sm:w-auto px-8 py-4 rounded-[12px] font-medium border border-tg-border text-tg-text hover:bg-tg-chat transition-all text-lg">
                  Sign In
                </button>
              </Link>
            </motion.div>

            {/* Feature Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 gap-4"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-tg-bg border border-tg-border rounded-xl p-4 hover:bg-tg-chat transition-all cursor-pointer group shadow-sm"
                >
                  <feature.icon size={28} className="text-tg-primary mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="text-sm font-semibold text-tg-text mb-1">{feature.title}</h3>
                  <p className="text-xs text-tg-secondary">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Content - Live Demo Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="hidden lg:block"
          >
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative"
            >
              {/* Chat Preview Mockup */}
              <div className="bg-tg-chat/40 backdrop-blur-2xl rounded-3xl p-6 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] border border-white/10">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                  <div className="w-12 h-12 rounded-2xl bg-tg-primary-gradient flex items-center justify-center shadow-lg shadow-tg-primary/20">
                    <ChatCircleText size={24} weight="fill" className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-tg-text font-bold text-lg">Global Chat</h3>
                    <p className="text-tg-secondary text-sm">2,481 members online</p>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-tg-green animate-pulse" />
                    <span className="text-tg-green text-sm font-medium">Live</span>
                  </div>
                </div>

                {/* Mock Messages */}
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-tg-bg border border-tg-border flex-shrink-0" />
                    <div className="bg-tg-incoming text-tg-text rounded-2xl rounded-bl-sm px-4 py-2 max-w-[80%] shadow-sm">
                      <p className="text-sm">Hey! Check out this new chat app! 🚀</p>
                    </div>
                  </motion.div>
 
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5 }}
                    className="flex gap-3 justify-end"
                  >
                    <div className="bg-tg-outgoing text-tg-text rounded-2xl rounded-br-sm px-4 py-2 max-w-[80%] shadow-sm">
                      <p className="text-sm">Wow, looks amazing! The animations are so smooth ✨</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-tg-primary-gradient flex-shrink-0" />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0" />
                    <div className="bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-2 max-w-[80%]">
                      <p className="text-white text-sm">Try it out! It's free to get started 💫</p>
                    </div>
                  </motion.div>

                  {/* Typing indicator */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0" />
                    <div className="bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium"
              >
                100% Free
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-4 -left-4 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium"
              >
                No Credit Card
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

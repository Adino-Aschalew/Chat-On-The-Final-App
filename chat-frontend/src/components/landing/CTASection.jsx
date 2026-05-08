import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkle } from '@phosphor-icons/react';

const CTASection = () => {
  return (
    <div className="py-24 px-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-tg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-tg-primary/10 border border-tg-primary/30 rounded-full mb-8"
        >
          <Sparkle size={16} className="text-tg-primary" />
          <span className="text-sm font-bold text-tg-primary uppercase tracking-widest">Limited Access</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl font-bold text-tg-text mb-8 leading-tight"
        >
          Ready to experience the <br />
          <span className="text-tg-primary">Future of Messaging?</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-xl text-tg-secondary mb-12 max-w-2xl mx-auto"
        >
          Join thousands of users who are already communicating faster, safer, and more beautifully. Get started for free today.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link to="/register" className="w-full sm:w-auto">
            <button className="btn-tg py-4 px-10 text-lg group w-full sm:w-auto">
              Create Free Account
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <button className="px-10 py-4 rounded-[12px] font-bold text-tg-text border border-tg-border hover:bg-tg-chat transition-all text-lg w-full sm:w-auto">
              Sign In
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default CTASection;

import { motion } from 'framer-motion';
import { Rocket, Users, ShieldCheck, Lightning, Heart, Globe, Sparkle } from '@phosphor-icons/react';

const AboutSection = () => {
  const values = [
    {
      icon: Rocket,
      title: 'Innovation',
      description: 'Pushing the boundaries of real-time communication.',
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      icon: ShieldCheck,
      title: 'Security',
      description: 'Enterprise-grade encryption for every message.',
      color: 'bg-tg-primary/10 text-tg-primary',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Built to bring people closer, wherever they are.',
      color: 'bg-tg-green/10 text-tg-green',
    },
    {
      icon: Lightning,
      title: 'Performance',
      description: 'Sub-50ms latency for instant interaction.',
      color: 'bg-purple-500/10 text-purple-500',
    },
  ];

  return (
    <section id="about" className="py-32 px-6 relative overflow-hidden bg-transparent">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-tg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-tg-primary/10 border border-tg-primary/30 rounded-full mb-6">
              <Sparkle size={16} weight="fill" className="text-tg-primary" />
              <span className="text-sm font-bold text-tg-primary uppercase tracking-widest">Our Mission</span>
            </div>
            <h2 className="text-5xl font-bold text-tg-text mb-8 leading-tight">
              We're redefining the <br />
              <span className="text-tg-primary">Language of Connection</span>
            </h2>
            <p className="text-xl text-tg-secondary leading-relaxed mb-10">
              ChatApp was built on the belief that communication should be effortless, secure, and beautiful. 
              We don't just send messages; we bridge the gap between people, ideas, and communities 
              through cutting-edge technology and human-centric design.
            </p>
            <div className="flex flex-wrap gap-8">
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-tg-text">99.9%</span>
                <span className="text-tg-secondary text-sm">Satisfaction</span>
              </div>
              <div className="w-[1px] h-12 bg-tg-border"></div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-tg-text">24/7</span>
                <span className="text-tg-secondary text-sm">Expert Support</span>
              </div>
              <div className="w-[1px] h-12 bg-tg-border"></div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-tg-text">Global</span>
                <span className="text-tg-secondary text-sm">Connectivity</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative z-10 rounded-[40px] overflow-hidden shadow-2xl border border-tg-border">
              <img 
                src="/about_collaboration_image_1777106046012.png" 
                alt="Collaboration" 
                className="w-full h-auto scale-105 hover:scale-100 transition-transform duration-700"
              />
            </div>
            {/* Floating Card */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-10 -left-10 bg-tg-bg/80 backdrop-blur-xl p-6 rounded-2xl border border-tg-border shadow-xl z-20 hidden md:block"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-tg-primary flex items-center justify-center text-white">
                  <Heart size={24} weight="fill" />
                </div>
                <div>
                  <h4 className="font-bold text-tg-text">Built with Love</h4>
                  <p className="text-sm text-tg-secondary">For millions of users</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="p-8 rounded-[32px] bg-tg-chat/50 border border-tg-border hover:bg-tg-chat hover:border-tg-primary/30 transition-all duration-300 group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${value.color}`}>
                <value.icon size={32} weight="duotone" />
              </div>
              <h3 className="text-xl font-bold text-tg-text mb-3">{value.title}</h3>
              <p className="text-tg-secondary leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

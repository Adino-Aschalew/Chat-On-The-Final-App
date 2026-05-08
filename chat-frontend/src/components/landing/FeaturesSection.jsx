import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ChatsCircle,
  Paperclip,
  Smiley,
  Translate,
  Calendar,
  ChartBar,
} from '@phosphor-icons/react';

const FeaturesSection = () => {
  const features = [
    {
      icon: ChatsCircle,
      title: 'Message Threading',
      desc: 'Organize conversations with threaded replies',
    },
    {
      icon: Paperclip,
      title: 'File Attachments',
      desc: 'Share images, documents, and more',
    },
    {
      icon: Smiley,
      title: 'Message Reactions',
      desc: 'Express yourself with emoji reactions',
    },
    {
      icon: Translate,
      title: 'Translation',
      desc: 'Break language barriers with auto-translation',
    },
    {
      icon: Calendar,
      title: 'Message Scheduling',
      desc: 'Schedule messages to send later',
    },
    {
      icon: ChartBar,
      title: 'Analytics',
      desc: 'Track usage with detailed analytics',
    },
  ];

  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-tg-text mb-4">Powerful Features</h2>
          <p className="text-tg-secondary text-lg">Everything you need for modern communication</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-tg-chat/50 border border-tg-border rounded-xl p-6 hover:bg-tg-chat transition-colors"
            >
              <feature.icon size={40} className="text-tg-primary mb-4" />
              <h3 className="text-xl font-semibold text-tg-text mb-2">{feature.title}</h3>
              <p className="text-tg-secondary">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

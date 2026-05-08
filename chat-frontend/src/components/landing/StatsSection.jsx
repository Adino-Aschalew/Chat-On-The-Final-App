import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Users, ChatsCircle, Globe, ShieldCheck } from '@phosphor-icons/react';
import { statsService } from '../../services/statsService';

const StatsSection = () => {
  const [data, setData] = useState({
    activeUsers: '0+',
    messagesSent: '0+',
    countries: '0+',
    uptimeSla: '99.9%'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await statsService.getLandingStats();
        if (response.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error('Using fallback stats');
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { icon: Users, value: data.activeUsers, label: 'Active Users', color: 'text-blue-500' },
    { icon: ChatsCircle, value: data.messagesSent, label: 'Messages Sent', color: 'text-tg-primary' },
    { icon: Globe, value: data.countries, label: 'Countries', color: 'text-tg-green' },
    { icon: ShieldCheck, value: data.uptimeSla, label: 'Uptime SLA', color: 'text-purple-500' },
  ];

  return (
    <div className="py-24 bg-transparent relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
              className="text-center group"
            >
              <div className="flex justify-center mb-4">
                <div className={`p-4 rounded-2xl bg-tg-chat border border-tg-border group-hover:scale-110 transition-transform duration-300 ${stat.color}`}>
                  <stat.icon size={32} weight="duotone" />
                </div>
              </div>
              <h3 className="text-4xl font-bold text-tg-text mb-1 tracking-tight">{stat.value}</h3>
              <p className="text-tg-secondary font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsSection;

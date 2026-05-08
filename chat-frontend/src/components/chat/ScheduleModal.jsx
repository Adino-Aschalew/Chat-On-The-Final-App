import { useState } from 'react';
import { motion } from 'framer-motion';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Calendar, Clock, Repeat } from '@phosphor-icons/react';
import { useTheme } from '../../contexts/ThemeContext';
import { format, addHours, addDays, addMonths, parse } from 'date-fns';

const ScheduleModal = ({ isOpen, onClose, onSchedule, initialContent }) => {
  const { theme } = useTheme();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(format(addHours(new Date(), 1), 'HH:mm'));
  const [isRecurring, setIsRecurring] = useState(false);
  const [pattern, setPattern] = useState('DAILY');
  const [endDate, setEndDate] = useState(format(addMonths(new Date(), 1), 'yyyy-MM-dd'));

  const handleConfirm = () => {
    const scheduledFor = parse(`${date} ${time}`, 'yyyy-MM-dd HH:mm', new Date());
    
    if (scheduledFor <= new Date()) {
      alert('Scheduled time must be in the future');
      return;
    }

    onSchedule({
      scheduledFor,
      isRecurring,
      recurringPattern: isRecurring ? pattern : null,
      recurringEndDate: isRecurring ? new Date(endDate) : null
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Schedule Message" size="sm">
      <div className="space-y-4">
        <div className={`p-3 rounded-lg text-sm italic mb-4 ${theme === 'dark' ? 'bg-slate-700/50 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
          "{initialContent}"
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>Date</label>
            <div className={`flex items-center gap-2 p-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-300'}`}>
              <Calendar size={18} className="text-amber-500" />
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent outline-none text-sm w-full"
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>Time</label>
            <div className={`flex items-center gap-2 p-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-300'}`}>
              <Clock size={18} className="text-amber-500" />
              <input 
                type="time" 
                value={time} 
                onChange={(e) => setTime(e.target.value)}
                className="bg-transparent outline-none text-sm w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <input 
            type="checkbox" 
            id="recurring" 
            checked={isRecurring} 
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
          />
          <label htmlFor="recurring" className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
            Repeat this message
          </label>
        </div>

        {isRecurring && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="space-y-4 pt-2"
          >
            <div className="space-y-1">
              <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>Frequency</label>
              <select 
                value={pattern} 
                onChange={(e) => setPattern(e.target.value)}
                className={`w-full p-2 rounded-lg border text-sm outline-none ${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-300'}`}
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className={`text-xs font-bold uppercase ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>End Date</label>
              <div className={`flex items-center gap-2 p-2 rounded-lg border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-300'}`}>
                <Calendar size={18} className="text-amber-500" />
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent outline-none text-sm w-full"
                  min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            Cancel
          </button>
          <Button onClick={handleConfirm} className="px-6">
            Schedule Message
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ScheduleModal;

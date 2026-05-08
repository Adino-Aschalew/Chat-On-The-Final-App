import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';
import { toast } from 'sonner';
import { ChartLineUp, Users, ChatCircle, ChatText } from '@phosphor-icons/react';

const AnalyticsChart = () => {
  const { theme } = useTheme();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChats: 0,
    totalMessages: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await api.get('/admin/stats');
      console.log('Admin stats response:', response.data);
      const data = response.data?.data || response.data;
      
      // Use real data from API or fallback to 0
      setStats({
        totalUsers: data?.totalUsers || 0,
        totalChats: data?.totalChats || 0,
        totalMessages: data?.totalMessages || 0,
        activeUsers: data?.onlineUsers || 0,
      });
    } catch (error) {
      console.error('Analytics error:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={`p-8 text-center ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Loading analytics...</div>;
  }

  const maxValue = Math.max(stats.totalUsers, stats.totalChats, stats.totalMessages, 1);

  // Calculate percentages for pie chart
  const total = stats.totalUsers + stats.totalChats + stats.totalMessages;
  const usersPercent = total > 0 ? (stats.totalUsers / total) * 100 : 0;
  const chatsPercent = total > 0 ? (stats.totalChats / total) * 100 : 0;
  const messagesPercent = total > 0 ? (stats.totalMessages / total) * 100 : 0;

  // Calculate conic gradient for pie chart
  const usersEnd = usersPercent;
  const chatsEnd = usersPercent + chatsPercent;
  const pieChartStyle = {
    background: `conic-gradient(
      from 0deg,
      #3b82f6 0deg ${usersEnd * 3.6}deg,
      #10b981 ${usersEnd * 3.6}deg ${chatsEnd * 3.6}deg,
      #8b5cf6 ${chatsEnd * 3.6}deg 360deg
    )`
  };

  return (
    <div className="p-6">
      <h2 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`rounded-xl p-6 border ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Users size={20} className="text-blue-400" />
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Total Users</p>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalUsers}</p>
        </div>
        <div className={`rounded-xl p-6 border ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <ChatCircle size={20} className="text-emerald-400" />
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Total Chats</p>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalChats}</p>
        </div>
        <div className={`rounded-xl p-6 border ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <ChatText size={20} className="text-purple-400" />
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Total Messages</p>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalMessages}</p>
        </div>
        <div className={`rounded-xl p-6 border ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <ChartLineUp size={20} className="text-green-400" />
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Active Users</p>
          </div>
          <p className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.activeUsers}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`rounded-xl p-6 border ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <ChatText size={20} className="text-purple-400" />
            System Overview
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>Users</span>
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalUsers}</span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${
                theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
              }`}>
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.totalUsers / maxValue) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>Chats</span>
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalChats}</span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${
                theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
              }`}>
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.totalChats / maxValue) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>Messages</span>
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalMessages}</span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${
                theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
              }`}>
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.totalMessages / maxValue) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className={`rounded-xl p-6 border ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <ChartLineUp size={20} className="text-green-400" />
            User Activity
          </h3>
          <div className="space-y-4">
            <div className={`flex items-center justify-between p-4 rounded-xl ${
              theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>Online Users</span>
              </div>
              <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.activeUsers}</span>
            </div>
            <div className={`flex items-center justify-between p-4 rounded-xl ${
              theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>Total Users</span>
              </div>
              <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{stats.totalUsers}</span>
            </div>
            <div className={`flex items-center justify-between p-4 rounded-xl ${
              theme === 'dark' ? 'bg-slate-700/50' : 'bg-gray-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>Active Rate</span>
              </div>
              <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalUsers > 0 ? `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}%` : '0%'}
              </span>
            </div>
          </div>
        </div>
        <div className={`rounded-xl p-6 border ${
          theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <ChatCircle size={20} className="text-emerald-400" />
            Distribution
          </h3>
          <div className="flex flex-col items-center">
            <div 
              className="w-48 h-48 rounded-full relative"
              style={pieChartStyle}
            >
              <div className={`absolute inset-4 rounded-full flex items-center justify-center ${
                theme === 'dark' ? 'bg-slate-800' : 'bg-white'
              }`}>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{total}</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Total</p>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-2 w-full">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className={theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}>Users</span>
                </div>
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{usersPercent.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className={theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}>Chats</span>
                </div>
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{chatsPercent.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className={theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}>Messages</span>
                </div>
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{messagesPercent.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;

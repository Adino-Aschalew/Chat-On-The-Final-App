import { formatDistanceToNow, format } from 'date-fns';

export const formatTimestamp = (date) => {
  if (!date) return '';
  const dateObj = new Date(date);
  const now = new Date();
  const diffInHours = (now - dateObj) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } else if (diffInHours < 7 * 24) {
    return format(dateObj, 'EEE, h:mm a');
  } else {
    return format(dateObj, 'MMM d, yyyy');
  }
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const formatUsername = (username) => {
  if (!username) return '';
  return username.charAt(0).toUpperCase() + username.slice(1);
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

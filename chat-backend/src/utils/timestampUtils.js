const moment = require('moment');

class TimestampUtils {
  /**
   * Format timestamp for display
   * @param {Date|string} timestamp - The timestamp to format
   * @param {string} format - The format to use (default: 'relative')
   * @returns {string} Formatted timestamp
   */
  static formatTimestamp(timestamp, format = 'relative') {
    if (!timestamp) return '';

    const date = moment(timestamp);
    const now = moment();

    switch (format) {
      case 'relative':
        return this.getRelativeTime(date, now);
      case 'time':
        return date.format('h:mm A');
      case 'date':
        return date.format('MMM D, YYYY');
      case 'datetime':
        return date.format('MMM D, YYYY h:mm A');
      case 'short':
        return date.format('M/D/YY h:mm A');
      case 'iso':
        return date.toISOString();
      case 'chat':
        return this.getChatTimestamp(date, now);
      default:
        return date.format(format);
    }
  }

  /**
   * Get relative time (e.g., "2 minutes ago")
   * @param {moment.Moment} date - The date to format
   * @param {moment.Moment} now - Current time
   * @returns {string} Relative time string
   */
  static getRelativeTime(date, now) {
    const diff = now.diff(date, 'seconds');

    if (diff < 60) {
      return 'just now';
    } else if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else if (diff < 604800) {
      const days = Math.floor(diff / 86400);
      return days === 1 ? '1 day ago' : `${days} days ago`;
    } else if (diff < 2592000) {
      const weeks = Math.floor(diff / 604800);
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    } else if (diff < 31536000) {
      const months = Math.floor(diff / 2592000);
      return months === 1 ? '1 month ago' : `${months} months ago`;
    } else {
      const years = Math.floor(diff / 31536000);
      return years === 1 ? '1 year ago' : `${years} years ago`;
    }
  }

  /**
   * Get chat-specific timestamp format
   * @param {moment.Moment} date - The date to format
   * @param {moment.Moment} now - Current time
   * @returns {string} Chat timestamp string
   */
  static getChatTimestamp(date, now) {
    const diff = now.diff(date, 'seconds');
    const isToday = date.isSame(now, 'day');
    const isYesterday = date.clone().subtract(1, 'day').isSame(now, 'day');
    const isThisWeek = date.isSame(now, 'week');
    const isThisYear = date.isSame(now, 'year');

    if (diff < 60) {
      return 'just now';
    } else if (isToday) {
      return date.format('h:mm A');
    } else if (isYesterday) {
      return `Yesterday ${date.format('h:mm A')}`;
    } else if (isThisWeek) {
      return date.format('ddd h:mm A');
    } else if (isThisYear) {
      return date.format('MMM D h:mm A');
    } else {
      return date.format('MMM D, YYYY h:mm A');
    }
  }

  /**
   * Group messages by date for chat display
   * @param {Array} messages - Array of messages with timestamps
   * @returns {Array} Messages grouped by date
   */
  static groupMessagesByDate(messages) {
    const groups = {};
    
    messages.forEach(message => {
      const date = moment(message.createdAt);
      const dateKey = date.format('YYYY-MM-DD');
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: dateKey,
          label: this.getDateLabel(date),
          messages: []
        };
      }
      
      groups[dateKey].messages.push(message);
    });

    return Object.values(groups).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
  }

  /**
   * Get human-readable date label
   * @param {moment.Moment} date - The date to get label for
   * @returns {string} Date label
   */
  static getDateLabel(date) {
    const now = moment();
    
    if (date.isSame(now, 'day')) {
      return 'Today';
    } else if (date.clone().subtract(1, 'day').isSame(now, 'day')) {
      return 'Yesterday';
    } else if (date.isSame(now, 'week')) {
      return date.format('dddd');
    } else if (date.isSame(now, 'year')) {
      return date.format('MMMM D');
    } else {
      return date.format('MMMM D, YYYY');
    }
  }

  /**
   * Check if timestamp is within last N minutes
   * @param {Date|string} timestamp - The timestamp to check
   * @param {number} minutes - Number of minutes to check
   * @returns {boolean} True if within last N minutes
   */
  static isWithinLastMinutes(timestamp, minutes) {
    const date = moment(timestamp);
    const cutoff = moment().subtract(minutes, 'minutes');
    return date.isAfter(cutoff);
  }

  /**
   * Check if timestamp is within last N hours
   * @param {Date|string} timestamp - The timestamp to check
   * @param {number} hours - Number of hours to check
   * @returns {boolean} True if within last N hours
   */
  static isWithinLastHours(timestamp, hours) {
    const date = moment(timestamp);
    const cutoff = moment().subtract(hours, 'hours');
    return date.isAfter(cutoff);
  }

  /**
   * Check if timestamp is within last N days
   * @param {Date|string} timestamp - The timestamp to check
   * @param {number} days - Number of days to check
   * @returns {boolean} True if within last N days
   */
  static isWithinLastDays(timestamp, days) {
    const date = moment(timestamp);
    const cutoff = moment().subtract(days, 'days');
    return date.isAfter(cutoff);
  }

  /**
   * Get start of day timestamp
   * @param {Date|string} timestamp - The timestamp
   * @returns {Date} Start of day
   */
  static getStartOfDay(timestamp) {
    return moment(timestamp).startOf('day').toDate();
  }

  /**
   * Get end of day timestamp
   * @param {Date|string} timestamp - The timestamp
   * @returns {Date} End of day
   */
  static getEndOfDay(timestamp) {
    return moment(timestamp).endOf('day').toDate();
  }

  /**
   * Get date range for a period
   * @param {string} period - 'today', 'yesterday', 'week', 'month', 'year'
   * @returns {Object} Date range with start and end dates
   */
  static getDateRange(period) {
    const now = moment();
    
    switch (period) {
      case 'today':
        return {
          start: now.clone().startOf('day').toDate(),
          end: now.clone().endOf('day').toDate()
        };
      case 'yesterday':
        return {
          start: now.clone().subtract(1, 'day').startOf('day').toDate(),
          end: now.clone().subtract(1, 'day').endOf('day').toDate()
        };
      case 'week':
        return {
          start: now.clone().startOf('week').toDate(),
          end: now.clone().endOf('week').toDate()
        };
      case 'month':
        return {
          start: now.clone().startOf('month').toDate(),
          end: now.clone().endOf('month').toDate()
        };
      case 'year':
        return {
          start: now.clone().startOf('year').toDate(),
          end: now.clone().endOf('year').toDate()
        };
      default:
        return {
          start: now.clone().startOf('day').toDate(),
          end: now.clone().endOf('day').toDate()
        };
    }
  }

  /**
   * Format duration in human-readable format
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration
   */
  static formatDuration(seconds) {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      const remainingMinutes = Math.floor((seconds % 3600) / 60);
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    } else {
      const days = Math.floor(seconds / 86400);
      const remainingHours = Math.floor((seconds % 86400) / 3600);
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }
  }
}

module.exports = TimestampUtils;

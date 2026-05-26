/**
 * Timezone Utility Functions for Frontend
 * Ensures all dates are formatted in Kigali, Rwanda timezone (Africa/Kigali - UTC+3)
 */

/**
 * Formats a date to Kigali local date string
 * @param {Date|string} date - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string in Kigali timezone
 */
export const formatKigaliDate = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    timeZone: 'Africa/Kigali',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  return new Intl.DateTimeFormat('en-GB', defaultOptions).format(new Date(date));
};

/**
 * Formats a date to Kigali local time string
 * @param {Date|string} date - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted time string in Kigali timezone
 */
export const formatKigaliTime = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    timeZone: 'Africa/Kigali',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    ...options
  };
  
  return new Intl.DateTimeFormat('en-GB', defaultOptions).format(new Date(date));
};

/**
 * Formats a date to Kigali local date and time string
 * @param {Date|string} date - The date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date-time string in Kigali timezone
 */
export const formatKigaliDateTime = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    timeZone: 'Africa/Kigali',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    ...options
  };
  
  return new Intl.DateTimeFormat('en-GB', defaultOptions).format(new Date(date));
};

/**
 * Formats a date to Kigali local date only (YYYY-MM-DD format)
 * @param {Date|string} date - The date to format
 * @returns {string} - Formatted date in YYYY-MM-DD format in Kigali timezone
 */
export const formatKigaliDateISO = (date) => {
  if (!date) return '';
  
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Kigali',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date));
};

/**
 * Gets the current Kigali time
 * @returns {Date} - Current date object
 */
export const getCurrentKigaliTime = () => {
  return new Date();
};

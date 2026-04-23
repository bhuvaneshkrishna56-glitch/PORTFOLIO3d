/**
 * Format a Firebase Timestamp or date string for display
 * @param {object|string} timestamp - Firebase Timestamp or ISO string
 * @returns {string} Formatted date string
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  
  let date;
  if (timestamp.toDate) {
    // Firebase Timestamp
    date = timestamp.toDate();
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else {
    date = new Date(timestamp);
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Truncate text to a maximum length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum character count
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Get file type category from MIME type
 * @param {string} mimeType - File MIME type
 * @returns {'image' | 'pdf' | 'unknown'}
 */
/**
 * Get file type category from MIME type or file name
 * @param {string} mimeType - File MIME type
 * @param {string} fileName - Optional file name for extension check
 * @returns {'image' | 'pdf' | 'unknown'}
 */
export const getFileCategory = (mimeType, fileName = '') => {
  const type = (mimeType || '').toLowerCase();
  const name = (fileName || '').toLowerCase();
  
  // 1. Check MIME type first
  if (type.startsWith('image/')) return 'image';
  if (type.includes('pdf')) return 'pdf';
  
  // 2. Backup: Check file extension from name
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || name.endsWith('.webp')) return 'image';
  
  return 'unknown';
};

/**
 * Generate a random position within bounds for 3D objects
 * @param {number} range - The range for random position
 * @returns {[number, number, number]} Position array [x, y, z]
 */
export const randomPosition = (range = 5) => {
  return [
    (Math.random() - 0.5) * range,
    (Math.random() - 0.5) * range,
    (Math.random() - 0.5) * range,
  ];
};

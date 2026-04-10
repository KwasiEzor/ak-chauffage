/**
 * Sanitization Utility
 * 
 * Provides functions to sanitize user-provided HTML and strings
 * to prevent Cross-Site Scripting (XSS) attacks.
 */

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const dompurify = createDOMPurify(window);

/**
 * Sanitize HTML string
 * @param {string} html - Raw HTML input
 * @param {Object} options - DOMPurify options
 * @returns {string} - Sanitized HTML
 */
const sanitizeHTML = (html, options = {}) => {
  if (typeof html !== 'string') return html;
  
  return dompurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'target', 'class', 'id', 'style'],
    ...options
  });
};

/**
 * Strip all HTML tags from a string
 * @param {string} str - Raw string
 * @returns {string} - Plain text string
 */
const stripHTML = (str) => {
  if (typeof str !== 'string') return str;
  return dompurify.sanitize(str, { ALLOWED_TAGS: [] });
};

/**
 * Sanitize an entire object recursively
 * @param {Object} obj - Object to sanitize
 * @returns {Object} - Sanitized object
 */
const sanitizeObject = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return typeof obj === 'string' ? stripHTML(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // If it's a known HTML field, use sanitizeHTML, otherwise strip all tags
    const htmlFields = ['message', 'notes', 'description', 'content', 'html'];
    
    if (htmlFields.includes(key.toLowerCase()) && typeof value === 'string') {
      sanitized[key] = sanitizeHTML(value);
    } else {
      sanitized[key] = sanitizeObject(value);
    }
  }

  return sanitized;
};

module.exports = {
  sanitizeHTML,
  stripHTML,
  sanitizeObject
};

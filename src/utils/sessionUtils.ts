/**
 * Session utilities for managing student session IDs
 */

const SESSION_ID_KEY = 'schoolmate_session_id';

/**
 * Generate a unique session ID
 */
export const generateSessionId = (): string => {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Get or create a session ID for the current user
 */
export const getSessionId = (): string => {
  // Check if session ID already exists
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  
  if (!sessionId) {
    // Generate new session ID
    sessionId = generateSessionId();
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  
  return sessionId;
};

/**
 * Clear the current session ID
 */
export const clearSessionId = (): void => {
  sessionStorage.removeItem(SESSION_ID_KEY);
};

/**
 * Get anonymous student identifier (first 8 chars of session ID)
 */
export const getStudentDisplayId = (): string => {
  const sessionId = getSessionId();
  return sessionId.substring(0, 8).toUpperCase();
};
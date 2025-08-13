/**
 * Utility function to send a standardized JSON response.
 *
 * @param {object} res - Express response object.
 * @param {number} status - HTTP status code to send.
 * @param {string} message - Message describing the result.
 * @param {object|null} [data=null] - Optional data payload to include in the response.
 */
export const sendResponse = (res, status, message, data = null) => {
  res.status(status).json({
    success: status >= 200 && status < 300,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

const admin = require('firebase-admin');
const { HttpsError } = require('firebase-functions/v2/https');

/**
 * checkRateLimit
 * Distributed rate limiter using Firestore.
 * 
 * @param {string} uid User ID to limit
 * @param {string} type Operation type (e.g. 'nic_registration')
 * @param {number} max Maximum allowed requests in the window
 * @param {number} windowMs Window size in milliseconds
 * @returns {Promise<void>} Throws resource-exhausted error if limited
 */
async function checkRateLimit(uid, type, max, windowMs) {
  const db = admin.firestore();
  const limitRef = db.collection('_internal_rate_limits').doc(`${uid}_${type}`);
  const now = Date.now();

  try {
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(limitRef);
      const data = doc.data() || { count: 0, resetAt: now + windowMs };

      // If window has passed, reset the bucket
      if (now > data.resetAt) {
        data.count = 1;
        data.resetAt = now + windowMs;
      } else {
        // Increment count within existing window
        data.count += 1;
      }

      if (data.count > max) {
        const remainingMinutes = Math.ceil((data.resetAt - now) / 60000);
        throw new HttpsError(
          'resource-exhausted',
          `Too many attempts. Please try again in ${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}.`,
          { resetAt: data.resetAt }
        );
      }

      transaction.set(limitRef, data, { merge: true });
    });
  } catch (error) {
    // If it's already an HttpsError, re-throw it
    if (error instanceof HttpsError) {
      throw error;
    }
    // Log unexpected errors but don't block the user unless necessary
    console.error('Rate limiter error:', error);
  }
}

module.exports = { checkRateLimit };

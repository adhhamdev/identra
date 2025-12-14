const crypto = require('crypto');
const admin = require('firebase-admin');
const { onCall } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { HttpsError } = require('firebase-functions/v2/https');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Define secret for NIC secret pepper
const nicSecretPepper = defineSecret('NIC_SECRET_PEPPER');

/**
 * Cloud Function: validateAndRegisterNIC
 * Validates NIC format, extracts derived info, computes hash for deduplication,
 * and saves to Firestore.
 *
 * Expected input:
 * {
 *   "nic": "981234567V" or "199812345678"
 * }
 *
 * Returns:
 * {
 *   "success": true,
 *   "data": {
 *     "nic": "981234567V",
 *     "nicType": "old",
 *     "birthYear": 1998,
 *     "dob": "1998-05-13",
 *     "gender": "male"
 *   }
 * }
 *
 * Error responses:
 * {
 *   "success": false,
 *   "error": "Invalid NIC format"
 * }
 */
exports.validateAndRegisterNIC = onCall(
  {
    region: 'asia-south1',
    memory: '256MiB',
    maxInstances: 10,
    secrets: [nicSecretPepper],
  },
  async (request) => {
    // Ensure user is authenticated
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'User must be authenticated to register NIC'
      );
    }

    // Verify email is verified
    if (!request.auth.token.email_verified) {
      throw new HttpsError(
        'permission-denied',
        'Your email must be verified to register your NIC.'
      );
    }

    const uid = request.auth.uid;
    const { nic } = request.data;

    // Validate input
    if (!nic || typeof nic !== 'string') {
      throw new HttpsError(
        'invalid-argument',
        'NIC is required and must be a string'
      );
    }

    // Clean NIC input
    const cleanNIC = nic.trim().toUpperCase();

    // Validate NIC format using regex
    const nicRegex =
      /^(([5,6,7,8,9]{1})([0-9]{1})([0,1,2,3,5,6,7,8]{1})([0-9]{6})([v|V|x|X]))|(([1,2]{1})([0-9]{1})([0-9]{2})([0,1,2,3,5,6,7,8]{1})([0-9]{7]))$/;
    if (!nicRegex.test(cleanNIC)) {
      throw new HttpsError(
        'invalid-argument',
        'Invalid NIC format. Please enter a valid Sri Lankan NIC number.'
      );
    }

    // Parse NIC and extract information
    let nicInfo;
    try {
      nicInfo = parseNIC(cleanNIC);
    } catch (error) {
      throw new HttpsError(
        'internal',
        'Failed to parse NIC. Please try again.'
      );
    }

    // Compute NIC hash for deduplication
    const nicHash = computeNICHash(cleanNIC);

    // Check for duplicate NIC
    const existingNICHash = await db
      .collection('nic_hashes')
      .doc(nicHash)
      .get();
    if (existingNICHash.exists) {
      const existingUID = existingNICHash.data()?.uid;
      if (existingUID !== uid) {
        throw new HttpsError(
          'already-exists',
          'This NIC number is already registered in our system.'
        );
      }
      // If same user, just return existing info
      return {
        success: true,
        data: nicInfo,
        message: 'NIC already registered',
      };
    }

    // Save NIC hash for deduplication
    await db.collection('nic_hashes').doc(nicHash).set({
      uid: uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Save user profile data
    await db
      .collection('users')
      .doc(uid)
      .set(
        {
          uid: uid,
          email: request.auth.token.email || null,
          nic_last4: getNICLast4(cleanNIC),
          dob: nicInfo.dob,
          gender: nicInfo.gender,
          birth_year: nicInfo.birthYear,
          nic_added_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    // Save private user data
    await db.collection('users_private').doc(uid).set(
      {
        nic_hash: nicHash,
        // nic_full_encrypted: REMOVED per security policy (Never store plaintext)
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        last_login: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return {
      success: true,
      data: nicInfo,
      message: 'NIC registered successfully',
    };
  }
);

/**
 * Parse Sri Lankan NIC and extract derived information
 */
function parseNIC(nic) {
  const isNewFormat = nic.length === 12;
  const nicType = isNewFormat ? 'new' : 'old';

  let birthYear;
  let dayOfYear;

  if (isNewFormat) {
    // New format: YYYYDDD...
    birthYear = parseInt(nic.substring(0, 4));
    dayOfYear = parseInt(nic.substring(4, 7));
  } else {
    // Old format: YYDDD...V/X
    const yearYY = parseInt(nic.substring(0, 2));
    birthYear = yearYY >= 50 ? 1900 + yearYY : 2000 + yearYY;
    dayOfYear = parseInt(nic.substring(2, 5));
  }

  // Determine gender
  const gender = dayOfYear > 500 ? 'female' : 'male';
  const adjustedDayOfYear = gender === 'female' ? dayOfYear - 500 : dayOfYear;

  // Convert day of year to full date
  const dob = dayOfYearToDate(birthYear, adjustedDayOfYear);

  return {
    nic: nic,
    nicType,
    birthYear,
    dob,
    gender,
  };
}

/**
 * Convert day of year to full date (YYYY-MM-DD)
 */
function dayOfYearToDate(year, dayOfYear) {
  const date = new Date(year, 0, 1); // January 1st
  date.setDate(date.getDate() + dayOfYear - 1);

  const yearStr = date.getFullYear().toString();
  const monthStr = (date.getMonth() + 1).toString().padStart(2, '0');
  const dayStr = date.getDate().toString().padStart(2, '0');

  return `${yearStr}-${monthStr}-${dayStr}`;
}

/**
 * Compute HMAC-SHA256 hash of NIC for deduplication
 */
function computeNICHash(nic) {
  const secretPepper =
    nicSecretPepper.value() || 'default-pepper-change-in-production';
  return crypto.createHmac('sha256', secretPepper).update(nic).digest('hex');
}

/**
 * Get last 4 digits of NIC for display purposes
 */
function getNICLast4(nic) {
  if (nic.length === 10) {
    return nic.substring(5, 9);
  } else {
    return nic.substring(8, 12);
  }
}

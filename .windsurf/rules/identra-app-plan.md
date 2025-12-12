---
trigger: always_on
---

Identra – MVP PRD and Implementation Plan

This document defines the product requirements, architecture, data model, and development roadmap for a mobile app (“Identra”) built with Expo/React Native and Firebase. The app enables users to securely manage personal government-issued documents (NIC, passport, license, certificates) and basic card/account info. It relies solely on Firebase’s free Spark plan (Auth, Firestore, Cloud Storage, Cloud Functions) and Expo APIs. All MVP features are detailed below with integration points, security considerations, and compliance requirements, followed by a development timeline and milestones.

1. MVP Feature Checklist & Firebase Integration

User Authentication (Firebase Auth):

1. User signs up

Use Firebase Authentication with one of the following:

Email + Password

Google OAuth (recommended — fastest and most secure consumer onboarding)

→ After sign-up, require email verification (automatic in Firebase).

2. Ask user to enter their NIC manually

After first sign-in → redirect to a "Add Your NIC" screen.

You do:

✔ Validate NIC format using your regex (^(([5,6,7,8,9]{1})([0-9]{1})([0,1,2,3,5,6,7,8]{1})([0-9]{6})([v|V|x|X]))|(([1,2]{1})([0,9]{1})([0-9]{2})([0,1,2,3,5,6,7,8]{1})([0-9]{7}))
)

This ensures the NIC is syntactically valid but does not connect to DRP.

✔ Extract DOB, Gender, and other derived info

Sri Lankan NIC rules allow extraction of:

Birth year

Birth day of the year (with gender encoded)

Gender (Male/Female)

Old NIC or New NIC type

These can be derived completely offline.

✔ Save derived fields in Firestore as part of the user's profile:
user: {
nic: "981234567V",
nic_type: "old" | "new",
birth_year: 1998,
dob: "1998-05-13",
gender: "male",
nic_added_at: timestamp
}

✔ Prevent duplicate NICs inside your own system

Simple dedupe check:

Compute HMAC_SHA256(nic, SECRET_PEPPER) on server (Cloud Function)

Store only the hash, not raw NIC

Check if the hash already exists in a global nic_hashes collection

This prevents replay/duplicates without storing NIC plaintext.

3. User can now continue and use the app

No selfies.
No document photos.
No OCR.
No tedious KYC.
No government API dependency.

Extremely clean and fast flow.

Why this works well for Identra

Your app is a personal identity storage + reminders + card wallet, not a government verification provider. So:

✦ You do not need to prove NIC authenticity

✦ You just need a unique, consistent identity key per user

✦ NIC derivation is allowed because it’s deterministic & user-provided

✦ Zero onboarding friction keeps user acceptance high

✦ No government integration needed

Perfect for a consumer-grade app.

🔐 Security Best Practices (Very Important)

1. Never store NIC in plaintext

Use:

NIC_HASH = HMAC_SHA256(NIC, SERVER_PEPPER)

Save:

users_private/{uid}.nic_hash

Optional:
Store NIC plaintext encrypted in Firestore using Firebase Client-Side Encryption SDK (End-to-End encryption).

2. Prevent duplicate NIC registrations

When user enters NIC:

Compute NIC_HASH in Cloud Function

Query nic_hashes/{NIC_HASH}

If exists → block & notify user

If not → store

nic_hashes/{NIC_HASH} = { uid }

3. Regex validate NIC carefully

Use exact same regex you provided before.

4. Enforce email verification

Before accessing main features.

🔢 NIC Parsing Logic (You will need this in the app)

Sri Lankan NIC formats:

Old Format: YYDDD…V/X

YY → birth year

DDD → birth day of year (001–366 for male, +500 for female)

New Format: YYYYDDD…

YYYY → birth year

DDD → birth day of year (same rules)

Gender Derivation
If DDD > 500 → female
Else → male

DOB Extraction

Example:
NIC: 199812345678

Year = 1998

DDD = 123 → 123rd day from Jan 1 → May 3

You convert day-of-year → full date.

🔧 Recommended Firebase Implementation
Firestore (User Public Info)
users/{uid}
name
email
nic_last4 // optional convenience
dob
gender
birth_year

Firestore (Private)
users_private/{uid}
nic_hash
created_at
last_login
nic_full_encrypted // optional E2EE

Cloud Functions

validateAndRegisterNIC()

Input: nic_string

Output: structured data (dob, gender, year)

Compute NIC hash

Dedup check

Write to DB.

Document & Card Upload (Firebase Storage): Let users capture photos (via expo-camera) or pick files (via expo-document-picker) for each document or card. Upload files to Firebase Cloud Storage under a per-user path (e.g. /users/{uid}/…). Use the Firebase JS SDK to call putFile or uploadBytes, ensuring HTTPS transport. Storage rules restrict access to the authenticated owner only
firebase.google.com
.

Metadata Storage (Cloud Firestore): Store document/card metadata (title, type, issue/expiry dates, storage path, notes) in Firestore. A suggested schema uses subcollections under each user:

/users/{uid}/documents/{docId} (fields: title, category, expiryDate, storagePath, etc.)

/users/{uid}/cards/{cardId} (fields: title, category, numberMasked, expiryDate, storagePath, etc.)

/users/{uid}/reminders/{remId} (fields: title, dueDate, linkedDocId).
Use Firestore security rules to enforce row-level security: e.g.,

service cloud.firestore {
match /databases/{db}/documents {
match /users/{userId}/{collection}/{docId} {
allow read, write: if request.auth.uid == userId;
}
}
}

This ensures each user can only access their own data
firebase.google.com
.

Offline Access & Sync: Enable full offline use of Firestore. Use the expo-firestore-offline-persistence library to polyfill Firestore offline mode in Expo
github.com
github.com
. Call firebase.firestore().enablePersistence() after initializing Firebase. Store downloaded files locally using expo-file-system so that images/documents can be viewed offline
docs.expo.dev
. Track network status with @react-native-community/netinfo to sync changes when reconnected
docs.expo.dev
.

Local Caching (expo-file-system): After downloading a document from Firebase Storage, cache it in the app’s file system (e.g. in the app’s cache directory) using FileSystem.downloadAsync()
docs.expo.dev
. This avoids re-downloading on each view and enables offline previews. Clear or refresh cache as needed.

Local Notifications (Expo Notifications): Allow users to set reminders for document/card expirations. Schedule local notifications on the device at the chosen date using Expo’s expo-notifications API
docs.expo.dev
. No backend cron jobs are used – when the app is in use or on restart, it reads due dates from local or Firestore data and schedules one-off notifications (with options for repeating, dates, etc.)
docs.expo.dev
.

Secure Sharing: Enable sharing document access by generating download URLs. Use Firebase Storage’s getDownloadURL() for non-expiring links (valid while file exists) and Cloud Functions + Admin SDK’s getSignedUrl() for expiring links
stackoverflow.com
stackoverflow.com
. If sharing in-app, ensure the recipient is authenticated and storage rules allow the read; otherwise, provide a signed URL from a short-lived Cloud Function endpoint. Signed URLs should be time-limited and revocable.

Data Encryption (Firebase): Firebase services automatically encrypt data at rest and in transit. Cloud Firestore data is encrypted by Google-managed keys by default
firebase.google.com
. Sensitive data (e.g. NIC/passport images, card numbers) are additionally protected by HTTPS and storage rules. Do not log or send personal data insecurely. Use Expo SecureStore to hold any client-side secrets (e.g. temporary auth tokens or PINs) with device encryption
docs.expo.dev
.

2. Data Model & Firestore Security Rules

A proposed Firestore schema (under each user’s namespace) is:

Collection: /users/{uid}/documents/
Document fields:

title (string) – e.g. “Passport”

type (enum) – e.g. “Passport”, “NIC”, etc.

expiryDate (timestamp)

storagePath (string) – reference path in Cloud Storage

createdAt, updatedAt (timestamps)

Collection: /users/{uid}/cards/
Document fields:

title (string) – e.g. “Visa Card”

cardType (string) – e.g. “Credit”

maskedNumber (string) – e.g. “\***\* \*\*** \*\*\*\* 1234”

expiryDate (timestamp)

storagePath (string) – card image path

createdAt, updatedAt

Collection: /users/{uid}/reminders/
Document fields:

title (string) – e.g. “Renew Driving License”

dueDate (timestamp) – when to notify

linkedDocId (string) – ID of related document or card

createdAt, updatedAt

This structure keeps each user’s data siloed. Firestore security rules enforce owner-only access, e.g.:

service cloud.firestore {
match /databases/{db}/documents {
match /users/{userId}/{collection}/{docId} {
allow read, write: if request.auth != null && request.auth.uid == userId;
}
}
}

This pattern (with the user’s UID in the path) ensures “content-owner only” access
firebase.google.com
firebase.google.com
. No other user or anonymous client can read/write another user’s data. Validation rules (e.g. types, expiry in future) can also be added.

3. Firebase Cloud Storage Usage

All documents/images are stored in Firebase Cloud Storage under user-specific paths (for example gs://<bucket>/users/{uid}/{fileName}). Key points:

Uploads/Downloads: In the Expo app, use the Firebase JS SDK or REST API. Convert captured images/files to Blobs or use uploadBytesResumable with fetch + FileSystem to get file URIs. On download, use getDownloadURL() to retrieve a public URL for the file (requires that security rules permit the read)
stackoverflow.com
.

Access Control: Storage security rules should mirror Firestore’s user ownership. For example:

service firebase.storage {
match /b/{bucket}/o {
match /users/{userId}/{fileName} {
allow read, write: if request.auth != null && request.auth.uid == userId;
}
}
}

This restricts every file to its owner only
firebase.google.com
. Do not make files public by default.

Signed URLs for Sharing: To share a document with an external party, implement a Cloud Function that uses the Admin SDK’s getSignedUrl() on the storage object (specifying an expiration)
stackoverflow.com
. Return that URL to the client to share. Alternatively, clients can call a callable Cloud Function to generate the URL. Ensure functions run within Spark quotas (free tier offers some invocations).

Expiry of URLs: Note that getDownloadURL() yields a non-expiring download link (until the file is deleted)
stackoverflow.com
. For true time-limited access, use the Admin SDK in Cloud Functions as above.

File Metadata: Store any extra metadata (e.g. original file name, type) in Firestore or the Storage object’s metadata. File sizes and types should be validated client-side and/or via Security Rules if needed.

4. Firebase Auth Setup and Best Practices

Auth Providers: Enable Email/Password authentication in Firebase console. For OTP (passwordless) login, use Email Link sign-in (magic link). Firebase supports sending a link to the user’s email which they click to authenticate
firebase.google.com
. This provides password-free access. Display clear UI messaging and use deep linking to handle the click-back.

Account Lifecycle: Enforce email verification: users should confirm their email before creating docs. Provide password reset via Firebase’s built-in flows. Use onAuthStateChanged to update app state.

Security Measures: Follow OWASP guidance on auth: require strong passwords, prevent brute force, and avoid exposing the OAuth flow in embedded webviews
docs.expo.dev
. Although Firebase keys are not secret, keep user tokens safe. Use expo-secure-store to cache tokens or PIN codes if implementing a secondary passcode
docs.expo.dev
.

MFA (Optional): For extra security, Firebase supports multi-factor (SMS) on paid plans. Given Spark limits, this can be deferred or replaced by device biometrics unlocking (see below).

Sign-Out and Token Handling: Always call signOut() on logout. Clear any cached credentials. Enable App Check for Cloud Functions to ensure only genuine clients call your backend (Expo’s App Integrity module can generate attestation tokens for this purpose
docs.expo.dev
).

5. Expo APIs and Native Capabilities

To build the native front-end, use Expo’s high-level libraries:

Camera (expo-camera): Use the Camera component to capture photos of documents
docs.expo.dev
. Configure permissions and allow toggling flash/zoom. Save captured images to the app cache (via Camera.takePictureAsync({ base64: false, exif: false })), then upload.

Document Picker (expo-document-picker): For PDF or image files already on device, use DocumentPicker.getDocumentAsync()
docs.expo.dev
. This invokes the system file picker.

File System (expo-file-system): To cache/download files, use FileSystem.downloadAsync(uri, localPath)
docs.expo.dev
. Store in a secure directory (e.g. FileSystem.cacheDirectory). Also use expo-file-system for uploading via uploadAsync().

Local Notifications (expo-notifications): Schedule reminders using Notifications.scheduleNotificationAsync({ content, trigger })
docs.expo.dev
. Set one-off triggers at the expiry date/time. Handle permissions and present notifications when due, even if app is backgrounded.

Secure Local Storage (expo-secure-store): Store any sensitive tokens or user PINs securely
docs.expo.dev
. For example, if the user unlocks the vault with a PIN or saves a session token, keep it in SecureStore, which uses Keychain/Keystore under the hood.

Biometric Authentication (expo-local-authentication): Optionally, allow users to secure the app behind biometrics (TouchID/FaceID)
docs.expo.dev
. Before showing sensitive content, call LocalAuthentication.authenticateAsync(). This adds a strong device-level unlock.

Network Info (@react-native-community/netinfo): Check online/offline status to control sync. Use NetInfo.fetch() or listener to detect connectivity
docs.expo.dev
. When reconnected, sync any queued writes or fetch updates.

Other Useful Expo Modules:

expo-image-manipulator to compress or rotate images before upload (optional).

expo-notifications (covered above).

expo-device or expo-constants to get device info (for logging or analytics).

All chosen Expo libraries are compatible with Expo Go or EAS Build (the plan should specify configuring required native permissions in app.json for camera, notifications, etc.).

6. Security and Compliance Best Practices

End-to-End Encryption: All communication with Firebase (Auth, Firestore, Storage) uses HTTPS. Firebase automatically encrypts data at rest with Google-managed AES-256 keys
firebase.google.com
. No additional action is needed to satisfy basic encryption-at-rest requirements.

Access Controls: Enforce Firebase Security Rules as above to ensure only owners see their data
firebase.google.com
firebase.google.com
. Never use weak rules like “allow if auth!=null” in production.

App Integrity: Use Expo’s App Integrity (@expo/app-integrity) to attest requests come from genuine, untampered apps
docs.expo.dev
. For example, before calling a Cloud Function for a signed URL, obtain an integrity token and send it to the function. This prevents a malicious script or modified app from abusing your backend.

Credentials Management: Do not hardcode secrets in the app. Firebase config (apiKey etc.) is safe to embed. If using Cloud Functions, secure the code and environment variables (they run server-side). For Expo build credentials (keystores, push keys), follow EAS security docs (they’re encrypted at rest
docs.expo.dev
).

Session Security: Use expo-secure-store for any local tokens or PINs
docs.expo.dev
. If a user logs out or uninstalls, ensure all cached data (including notifications and local DB entries) is cleared.

Vulnerability Mitigation: Regularly update dependencies (Expo and Firebase SDKs). Do not enable developer/Test mode in production. Use ProGuard/minification to obfuscate compiled JS if possible.

Incident Response: Implement logging (e.g. Crashlytics or your own) to monitor errors. While cloud logs can track backend access, on-device logs should avoid sensitive data. Prepare a response plan in case of breach (in line with PDPA Breach Notification).

7. Sri Lanka PDPA Compliance Considerations

Sri Lanka’s PDPA (effective March 2025) governs personal data protection, much like GDPR. Since the app handles highly sensitive personal data (government IDs, card numbers), ensure:

Consent & Transparency: Collect and process data only with user consent. Provide a Privacy Policy explaining what data is stored and for what purpose. The user is the data subject (owning their docs), but the service itself processes that data. Be clear that data is kept secure and private.

Data Minimization: Only collect necessary information. E.g., store only masked card numbers, not full PAN. Delete or anonymize data if no longer needed (e.g. expired documents can be archived/deleted per user request).

Security of Personal Data: Follow PDPA’s “appropriate security measures” guidance. The draft DPMP guidelines recommend strong safeguards: “encrypting sensitive data, role-based access, data center security, routine audits, vulnerability assessments, regular backups, and an incident response plan”
dlapiperdataprotection.com
. Many of these are built-in (Firebase encryption, security rules). Additionally, consider implementing user-initiated data deletion (on account delete, wipe all Firestore docs and Storage files for that uid).

Data Subject Rights: Allow users to exercise rights under PDPA (e.g. right to erase, rectify). Provide an easy way in-app or via support to delete all user data. (Since the user already "owns" their data in-app, an account deletion feature should remove all records from Firebase for that user.)

Data Transfers: While PDPA applies extraterritorially, using Firebase (Google Cloud) means data may reside outside Sri Lanka. Ensure compliance by noting Google’s global infrastructure and by adhering to high security standards (as PDPA does not forbid cross-border transfers, but requires adequate protection).

Data Protection Officer (DPO): For a small startup, a formal DPO may not be required, but designate someone responsible for data protection.

By aligning with these guidelines, the app meets both Firebase security and Sri Lanka PDPA standards. In sum, data is encrypted, access-controlled, and under user control.

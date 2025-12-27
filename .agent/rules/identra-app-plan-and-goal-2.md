---
trigger: always_on
---

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

# Identra – Production Identity & Wallet Roadmap (V2.0)

This document updates the original MVP plan with professional-grade security, sharing logic, and PDPA compliance strategies for a production-ready application.

## 1. Zero-Trust Architecture

Identra will transition from a simple data store to a **Zero-Trust Vault**.

- **Principle**: The cloud is the source of truth, but the device is the key.
- **Hybrid Storage**:
  - **Cloud**: Primary storage for metadata and encrypted assets.
  - **Device**: Encrypted local cache of frequently used Identity Objects (NIC, Passport).
  - **Encryption**: Files are ideally encrypted client-side using a key derived from the user's Biometric-protected `SecureStore` before upload.

## 2. The "Identity Object" Model

Documents are no longer just images. They are objects comprising:

- **Structural Metadata**: Title, Type, Expiry, Category.
- **Asset**: High-resolution scan (Encrypted).
- **Security Envelope**: HMAC signature to detect tampering.

## 3. Advanced Sharing Engine

The "Share with a Press" flow is designed for high security and low friction:

1. **Trigger**: User selects "Share".
2. **Authentication**: Mandatory Biometric gate (`expo-local-authentication`).
3. **Execution**:
   - **Signed URLs**: Use Firebase Cloud Functions to generate ephemeral, time-limited download links (5-10 mins).
   - **Watermarked PDFs**: Generate on-the-fly PDFs with a custom watermark (e.g., "Shared via Identra to [Recipient] on [Date]") to deter identity theft.
   - **Visual QR**: Display a high-entropy QR containing a pointer to the Signed URL.

## 4. PDPA & Compliance (Sri Lanka)

Adhering to PDPA (2023/2025) requires active data stewardship:

- **Data Minimization**: Users can choose to "Purge Sensitive Fields" while keeping metadata for reminders.
- **Account Purge**: A one-tap button to delete all Auth, Firestore, and Storage data.
- **Retention Policy**: Implement automated cleanup for accounts inactive for >24 months.

## 5. Security Moats

- **Biometric Gating**: Every transition to a sensitive document view or sharing action MUST be gated.
- **SecureStore**: All local secrets and decryption keys reside in hardware-backed storage.
- **App Check**: Enabled to block non-official app instances from accessing Firebase.

## 6. Implementation Checklist (Next Steps)

- [ ] Implement `expo-local-authentication` globally.
- [ ] Create Cloud Function/Logic for **Signed URL** generation.
- [ ] Integrate `expo-print` for watermarked PDF generation.
- [ ] Update `useCards` and `useDocuments` hooks to support client-side encryption.
- [ ] Add "Delete My Account" functionality in Settings.

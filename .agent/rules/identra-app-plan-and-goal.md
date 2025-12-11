---
trigger: always_on
---

MVP Feature Checklist

User Authentication: Email/password sign-up & login (Supabase Auth) and optional multi-factor/biometric login.

Document & Card Management: Add, upload or scan government documents (NIC, passport, etc.) and basic bank card/account info. Support capturing images with camera (e.g. expo-camera
docs.expo.dev
) or importing files (e.g. expo-document-picker
docs.expo.dev
). Display stored items securely in a gallery/list.

Secure Storage: Save files and data in Supabase (authenticated users) and locally. Use encrypted local storage (e.g. expo-secure-store
docs.expo.dev
for keys, and expo-file-system
docs.expo.dev
or expo-sqlite
docs.expo.dev
with encryption for file cache).

Expiration Reminders: Allow user to set reminders for document/card expiry dates. Schedule local notifications (e.g. via expo-notifications
docs.expo.dev
) to alert user before expiration.

Secure Sharing: Enable sharing of individual documents via QR codes or links. For example, generate a secure, time-limited share link (Supabase Signed URL
supabase.com
) or render a QR code. Implement in-app secure viewer. Ensure shared files are served over HTTPS.

Offline Access: Full offline functionality. Cache user’s documents and reminders locally (using expo-file-system/SQLite) so the app works without internet. When online, sync with Supabase. Encrypt cached data at rest.

Supabase Schema (Users, Documents, Reminders)

Use Supabase Auth for user identities and enforce Row-Level Security (RLS) so each user can only access their own data
supabase.com
. Recommended tables:

profiles (optional): id (UUID PK, matches Auth user ID), email, name, timestamps. (Supabase Auth provides user ID and email; use a profiles table if additional profile info is needed.)

documents: Stores user files. Columns: id (UUID PK), user_id (UUID FK → Auth UID), doc_type (enum: “NIC”, “Passport”, etc.), title, issue_date, expiry_date, storage_path (Supabase Storage URL or reference), plus audit fields (created_at, updated_at). Enforce RLS policy like USING (auth.uid() = user_id)
supabase.com
so each user sees only their documents.

cards: Stores basic bank card/account details. Columns: id (UUID PK), user_id (UUID FK), card_name (e.g. “Visa \*\*\*\* 1234”), card_type (enum: Credit/Debit), bank_name, expiry_date, last4_digits, notes, timestamps. Only store non-sensitive info (no CVV or full PAN). Use RLS to restrict access.

reminders: Stores user reminders. Columns: id (UUID PK), user_id (UUID FK), document_id or card_id (UUID, FK to link to related item), reminder_date, message, timestamps. RLS filters by user_id. The app can also derive reminders from expiry_date fields.

(Enable Supabase Storage for files. Use signed URLs for sharing files safely
supabase.com
. Supabase projects are encrypted at rest by default
supabase.com
, and RLS provides end-to-end user-level access control
supabase.com
.)

Expo Device APIs

The following Expo APIs will be used:

Camera (expo-camera): To capture or scan document images and QR/barcodes
docs.expo.dev
. (Supports barcodes/QR detection.)

Document Picker (expo-document-picker): To import existing PDFs or images from device storage
docs.expo.dev
.

File System (expo-file-system): To save downloaded documents for offline access and caching
docs.expo.dev
.

Secure Store (expo-secure-store): To encryptently store sensitive values (e.g. auth tokens or encryption keys) on device
docs.expo.dev
.

Local Authentication (expo-local-authentication): To authenticate/unlock app via fingerprint or FaceID
docs.expo.dev
.

Notifications (expo-notifications): To schedule and present expiration reminders to the user
docs.expo.dev
.

SQLite (expo-sqlite): For an offline local database of document metadata and reminders
docs.expo.dev
. (Use encryption plugin or store only non-sensitive indices.)

Sharing (expo-sharing): To share document files via native share-sheet (email, chat, etc.)
docs.expo.dev
. (For QR code generation/scan, use a library like react-native-qrcode-svg or expo-barcode-scanner.)

Each of these modules is built for Expo/React Native (no native code needed) and supports Android and iOS.

OCR / Document Scanning APIs

To extract text from documents or enhance scanning, consider these free/low-cost services:

OCR.space API: A free OCR service (500 requests/day, up to 1 MB/image)
ocr.space
. Easy HTTP integration for quick text extraction.

Google Cloud Vision: Powerful OCR; free tier includes 1,000 text-detection units per month
cloud.google.com
. (Can use via REST from a backend or Cloud Function.)

AWS Textract: OCR and structured text detection; AWS Free Tier provides up to 1,000 pages/month for three months
aws.amazon.com
.

On-device ML (open-source): e.g. Google ML Kit text recognition libraries or Tesseract via community packages (free, offline). Note: Expo managed apps may require EAS builds or use of TensorFlow.js.
These allow scanning IDs or certificates to auto-fill metadata. For PDFs, consider allowing PDF import and using cloud OCR only as a non-critical enhancement.

Security Best Practices

Data Encryption (in transit): Use HTTPS/TLS for all network calls
reactnative.dev
(Supabase uses SSL by default). Do not use HTTP. Consider certificate pinning for extra security.

Data Encryption (at rest): Rely on Supabase’s encryption-at-rest (enabled by default
supabase.com
). For extra-sensitive fields (e.g. national ID numbers), consider encrypting on the client or in the database using PostgreSQL encryption functions.

Local Storage Security: Store only non-sensitive data in plaintext. Save tokens/keys in expo-secure-store (Keychain/Keystore)
docs.expo.dev
reactnative.dev
. Do NOT store secrets or auth tokens in AsyncStorage or code
reactnative.dev
. Encrypt any files saved to disk if they contain personal data.

Authentication & Access Control: Use Supabase Auth (email/OTP login). Enforce strong passwords and optionally MFA. Enable Row-Level Security on all tables so users can only query their own records
supabase.com
. Verify auth.uid() in policies.

Sharing Security: When generating share links, use time-limited signed URLs (Supabase storage createSignedUrl)
supabase.com
so links expire. Avoid making buckets publicly readable. QR codes should embed only identifiers or encrypted tokens, not raw data.

Network Security: Always communicate over HTTPS
reactnative.dev
. Consider SSL pinning to guard against MITM (especially on Android). Validate and handle untrusted certificates safely.

Card Data Handling: Follow PCI guidelines – minimize stored card info
stripe.com
. Store only non-sensitive parts (e.g. last 4 digits) and expiration. Encrypt any stored card data with AES-256
stripe.com
. Never store CVV. Transmit card/account info only over secure channels.

General App Security: Regularly update Expo and libraries. Obfuscate code if possible. Use environment variables (via app.config) for any API keys. Conduct security reviews and penetration tests before launch. Always code defensively (validate all inputs, avoid SQL injection via parameterized queries).

Sri Lanka Compliance (PDPA, Security, etc.)

Personal Data Protection Act (PDPA) 2022: Sri Lanka’s PDPA (No. 9 of 2022) – modeled on the EU GDPR – governs personal data of Sri Lankan citizens
dlapiperdataprotection.com
dlapiperdataprotection.com
. It comes into full effect (major provisions) by Mar 2025
dlapiperdataprotection.com
. Under PDPA, storing NIC/passport numbers and bank details counts as processing sensitive personal data. You must obtain explicit user consent, secure the data by design, and honor user rights (access, correction, deletion).

Data Security Obligations: PDPA mandates “appropriate security safeguards” for personal data. Draft guidelines advise encrypting sensitive data and using role-based access controls
dlapiperdataprotection.com
. We should treat user IDs and financial info with high confidentiality, encrypting data in transit and at rest. Implement breach notification processes per PDPA.

Sector Regulations: If handling any financial data, note Sri Lanka’s Financial Consumer Protection Regulations 2023 (for banks/fintechs) also emphasize protecting financial consumer data. While our app is not a bank, it’s prudent to follow similar standards (secure storage, consent).

Mobile App/IT Security Rules: Ensure compliance with local telecom/regulator policies. Follow OWASP Mobile Top 10 (secure coding) and any guidelines by Sri Lanka’s Data Protection Authority. If necessary, register the data processing with the PDPA Authority.

Privacy by Design: Build consent dialogs and privacy notices into the app. Only collect/document what users explicitly share. Ensure data subjects can delete their data (e.g. “delete account” option). Use anonymization if analyzing any aggregate usage (outside MVP scope).

Development Lifecycle Plan (SDLC)

Following an agile SDLC, break work into phases with clear deliverables:

Planning & Requirements (Week 1): Finalize PRD and feature list. Define user stories and acceptance criteria. Deliverables: Detailed PRD (this document), system architecture diagram, Supabase schema design, security plan. [Planning phase includes defining goals, audience, and scope
practicallogix.com
.]

Design & Prototyping (Week 2): Create UI/UX wireframes and click-through prototypes for key screens (login, document gallery, detail view, reminders). Review design with stakeholders. Finalize tech stack (Expo SDK versions, Supabase setup). Deliverables: Wireframes/Mockups, API contract docs.

Core Development Sprint 1 (Weeks 3–4): Implement user authentication flows and profile management (Supabase Auth). Build document upload/scan feature with camera integration and storage (Expo Camera + Supabase Storage). Test basic document listing and viewing. Deliverables: Functioning login/signup; document add/list/view.

Core Development Sprint 2 (Weeks 5–6): Implement card/account details management and the reminders system. Integrate local notifications (expo-notifications) and scheduling logic. Add editing and deleting of items. Deliverables: Document/card detail screens, reminder scheduling, notification on test device.

Offline & Sync (Week 7): Enable offline caching: store docs and data locally using expo-file-system/SQLite. Implement synchronization logic to upload new data when online. Ensure RLS policies on Supabase tables are correctly enforced. Deliverables: App functions offline and syncs updates, with no data loss.

Sharing & Security Features (Week 8): Add secure sharing: implement generation of signed share links (Supabase createSignedUrl
supabase.com
) and QR codes. Integrate biometric lock (expo-local-authentication) for accessing sensitive views. Perform security review (pen-test sample, check RLS). Deliverables: Document share UI (e.g. “Share” button generates QR or copy link), biometric unlock.

Testing & QA (Week 9): Conduct functional testing on multiple devices (Android/iOS). Perform usability testing with sample users. Fix bugs and refine UI. Validate compliance (ensure privacy prompts are in place). Deliverables: Test report, bug-fix release.

Deployment & Launch (Week 10): Prepare production builds. Register app with Google Play and/or Apple App Store. Set up Supabase production project (enable RLS, configure storage buckets). Deploy backend functions if any. Deliverables: Published app, monitoring setup (error reporting), and a short training doc for support.

Throughout, hold weekly demos. After launch, gather user feedback and plan future updates (e.g. analytics, bank linking in v2).

Milestones Summary: planning/design → development sprints (features) → testing → launch
practicallogix.com
. Each phase should produce clear deliverables (specs, code, or documentation) before moving on. This ensures the team has a roadmap and can begin implementation immediately.

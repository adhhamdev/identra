export interface UserProfile {
  uid: string;
  email: string | null;
  name?: string;
  phone?: string;
  nic_last4: string;
  dob: string;
  gender: 'male' | 'female';
  birth_year: number;
  nic_added_at: any; // Firestore Timestamp
  updated_at: any;
}

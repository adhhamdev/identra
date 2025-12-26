import { Timestamp } from 'firebase/firestore';

export interface PassportFormData {
  fullName: string;
  passportNumber: string;
  nationality: string;
  countryCode: string;
  dateOfBirth: string;
  issueDate: string;
  expiryDate: string;
}

export interface PassportRecord extends PassportFormData {
  id: string;
  flagUrl?: string;
  isEncrypted?: boolean;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

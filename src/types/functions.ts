export interface validateAndRegisterNICResponse {
  success: boolean;
  data?: {
    nic: string;
    nicType: "old" | "new";
    birthYear: number;
    dob: string;
    gender: "male" | "female";
  };
  error?: string;
}
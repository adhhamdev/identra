export interface NICInfo {
  nic: string;
  nicType: 'old' | 'new';
  birthYear: number;
  dob: string; // YYYY-MM-DD
  gender: 'male' | 'female';
}

/**
 * Validate Sri Lankan NIC format
 * Supports both old (YYDDD...V/X) and new (YYYYDDD...) formats
 */
export function validateNIC(nic: string): boolean {
  const regex = /^(([5,6,7,8,9]{1})([0-9]{1})([0,1,2,3,5,6,7,8]{1})([0-9]{6})([v|V|x|X]))|(([1,2]{1})([0-9]{1})([0-9]{2})([0,1,2,3,5,6,7,8]{1})([0-9]{7}))$/;
  return regex.test(nic);
}

/**
 * Parse Sri Lankan NIC and extract derived information
 */
export function parseNIC(nic: string): NICInfo | null {
  if (!validateNIC(nic)) {
    return null;
  }

  const cleanNIC = nic.toUpperCase();
  const isNewFormat = cleanNIC.length === 12;
  const nicType: 'old' | 'new' = isNewFormat ? 'new' : 'old';

  let birthYear: number;
  let dayOfYear: number;

  if (isNewFormat) {
    // New format: YYYYDDD...
    birthYear = parseInt(cleanNIC.substring(0, 4));
    dayOfYear = parseInt(cleanNIC.substring(4, 7));
  } else {
    // Old format: YYDDD...V/X
    const yearYY = parseInt(cleanNIC.substring(0, 2));
    birthYear = yearYY >= 50 ? 1900 + yearYY : 2000 + yearYY;
    dayOfYear = parseInt(cleanNIC.substring(2, 5));
  }

  // Determine gender
  const gender = dayOfYear > 500 ? 'female' : 'male';
  const adjustedDayOfYear = gender === 'female' ? dayOfYear - 500 : dayOfYear;

  // Convert day of year to full date
  const dob = dayOfYearToDate(birthYear, adjustedDayOfYear);

  return {
    nic: cleanNIC,
    nicType,
    birthYear,
    dob,
    gender,
  };
}

/**
 * Convert day of year to full date (YYYY-MM-DD)
 */
function dayOfYearToDate(year: number, dayOfYear: number): string {
  const date = new Date(year, 0, 1); // January 1st
  date.setDate(date.getDate() + dayOfYear - 1);
  
  const yearStr = date.getFullYear().toString();
  const monthStr = (date.getMonth() + 1).toString().padStart(2, '0');
  const dayStr = date.getDate().toString().padStart(2, '0');
  
  return `${yearStr}-${monthStr}-${dayStr}`;
}

/**
 * Get last 4 digits of NIC for display purposes
 */
export function getNICLast4(nic: string): string {
  const cleanNIC = nic.toUpperCase();
  if (cleanNIC.length === 10) {
    return cleanNIC.substring(5, 9);
  } else {
    return cleanNIC.substring(8, 12);
  }
}

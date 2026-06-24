export const KG_TO_LB = 2.20462;
export const CM_TO_IN = 0.393701;

export const ageFromDateOfBirth = (dob: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
};

export const cmToFeetInches = (cm: number): { feet: number; inches: number } => {
  const totalInches = Math.round(cm * CM_TO_IN);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return { feet, inches };
};

export const feetInchesToCm = (feet: number, inches: number): number => {
  const totalInches = feet * 12 + inches;
  return Math.round(totalInches / CM_TO_IN);
};

export const kgToLb = (kg: number): number => Math.round(kg * KG_TO_LB);

export const lbToKg = (lb: number): number => Math.round((lb / KG_TO_LB) * 10) / 10;

export const computeBmi = (weightKg: number, heightCm: number): number => {
  const heightM = heightCm / 100;
  if (heightM <= 0) return 0;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
};

export const formatDob = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const firstNameFromFullName = (fullName: string): string => {
  const trimmed = fullName.trim();
  if (!trimmed) return 'there';
  return trimmed.split(/\s+/)[0] ?? trimmed;
};

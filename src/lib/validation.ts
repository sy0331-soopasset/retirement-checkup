export function sanitize(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

export function validatePhone(phone: string): boolean {
  return /^01[0-9]-?\d{3,4}-?\d{4}$/.test(phone.replace(/\s/g, ''));
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= 50;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateConsultationForm(data: {
  name: string;
  phone: string;
  email: string;
}): ValidationResult {
  if (!validateName(data.name)) {
    return { valid: false, error: '이름을 올바르게 입력해주세요.' };
  }
  if (!validatePhone(data.phone)) {
    return { valid: false, error: '올바른 연락처를 입력해주세요. (예: 010-1234-5678)' };
  }
  if (!validateEmail(data.email)) {
    return { valid: false, error: '올바른 이메일 주소를 입력해주세요.' };
  }
  return { valid: true };
}

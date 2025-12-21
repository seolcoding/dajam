/**
 * 주민등록번호 포맷 (NNNNNN-NNNNNNN)
 */
export function formatRRN(value: string): string {
  const numbers = value.replace(/[^0-9]/g, '');
  if (numbers.length <= 6) {
    return numbers;
  }
  return `${numbers.slice(0, 6)}-${numbers.slice(6, 13)}`;
}

/**
 * 사업자등록번호 포맷 (NNN-NN-NNNNN)
 */
export function formatBRN(value: string): string {
  const numbers = value.replace(/[^0-9]/g, '');
  if (numbers.length <= 3) {
    return numbers;
  }
  if (numbers.length <= 5) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  }
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`;
}

/**
 * 법인등록번호 포맷 (NNNNNN-NNNNNNN)
 */
export function formatCRN(value: string): string {
  const numbers = value.replace(/[^0-9]/g, '');
  if (numbers.length <= 6) {
    return numbers;
  }
  return `${numbers.slice(0, 6)}-${numbers.slice(6, 13)}`;
}

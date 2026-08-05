/**
 * Formats a Brazilian phone number for display:
 * 11 digits → "(11) 98765-4321" · 10 digits → "(11) 9876-5432".
 * Malformed input (not enough digits) is returned unchanged.
 */
export function formatPhoneBR(phone: string): string {
	const digits = phone.replace(/\D/g, '');
	if (digits.length === 11) {
		return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
	}
	if (digits.length === 10) {
		return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
	}
	return phone;
}

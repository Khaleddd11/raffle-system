export function normalizeEgyptPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");

  if (!digits) {
    return null;
  }

  // Allow country code prefix 20 (e.g., 2011xxxxxxx) by stripping it.
  let normalized = digits;
  if (normalized.startsWith("20") && normalized.length === 12) {
    normalized = normalized.slice(2);
  }

  // Allow numbers missing the leading 0 (e.g., 1140...) by adding it.
  if (normalized.length === 10 && normalized.startsWith("1")) {
    normalized = `0${normalized}`;
  }

  // Accept 11-digit local mobile numbers starting with 0.
  if (normalized.length === 11 && normalized.startsWith("0")) {
    return normalized;
  }

  return null;
}

export function maskPhone(phone: string): string {
  if (phone.length < 4) {
    return phone;
  }
  const tail = phone.slice(-4);
  return `${"*".repeat(Math.max(0, phone.length - 4))}${tail}`;
}


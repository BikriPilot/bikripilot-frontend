export const toLatinDigits = (value: string) =>
  value.replace(/[০-৯]/g, (digit) => String("০১২৩৪৫৬৭৮৯".indexOf(digit)));
export const normalizeBdPhone = (value: string) => {
  const digits = toLatinDigits(value).replace(/[^0-9+]/g, "");
  if (digits.startsWith("+880")) return `0${digits.slice(4)}`;
  if (digits.startsWith("880")) return `0${digits.slice(3)}`;
  return digits;
};
export const isValidBdPhone = (value: string) =>
  /^01[3-9]\d{8}$/.test(normalizeBdPhone(value));

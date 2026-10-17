const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** "12:05" → "১২:০৫" for the bn locale; other locales pass through unchanged. */
export function localizeDigits(value: string, locale: "bn" | "en"): string {
  if (locale !== "bn") return value;
  return value.replace(/\d/g, (digit) => BENGALI_DIGITS[Number(digit)]);
}

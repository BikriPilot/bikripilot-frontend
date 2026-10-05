import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const banglaPattern = /[\u0980-\u09FF]/;
const banglaDigit = /[০-৯]/;
const englishBanglaAllowlist = new Set(["common.languageNameBn"]);
const flatten = (value: unknown, prefix = "") => {
  const output: Record<string, string> = {};
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value))
      Object.assign(output, flatten(child, prefix ? `${prefix}.${key}` : key));
  } else if (typeof value === "string") output[prefix] = value;
  return output;
};
const messages = async (locale: string) =>
  JSON.parse(
    await readFile(resolve("messages", `${locale}.json`), "utf8"),
  ) as unknown;
async function main() {
  const [en, bn] = await Promise.all([messages("en"), messages("bn")]);
  const english = flatten(en);
  const bangla = flatten(bn);
  const englishKeys = Object.keys(english).sort();
  const banglaKeys = Object.keys(bangla).sort();
  if (JSON.stringify(englishKeys) !== JSON.stringify(banglaKeys))
    throw new Error("en.json and bn.json have different keys");
  for (const key of englishKeys) {
    if (
      !english[key] ||
      !bangla[key] ||
      english[key].includes("TODO") ||
      bangla[key].includes("TODO")
    )
      throw new Error(`Empty or TODO translation: ${key}`);
    if (!englishBanglaAllowlist.has(key) && banglaPattern.test(english[key]))
      throw new Error(`Bangla text in English translation: ${key}`);
    if (banglaDigit.test(bangla[key]))
      throw new Error(`Bangla digit in translation: ${key}`);
    const placeholders = (text: string) =>
      [...text.matchAll(/\{[^}]+\}/g)]
        .map((match) => match[0])
        .sort()
        .join();
    if (placeholders(english[key]) !== placeholders(bangla[key]))
      throw new Error(`Placeholder mismatch: ${key}`);
  }
  console.log(`i18n ok: ${englishKeys.length} keys`);
}

void main();

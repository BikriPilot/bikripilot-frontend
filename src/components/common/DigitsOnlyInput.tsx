"use client";

import type { ComponentProps } from "react";

const banglaDigits = "০১২৩৪৫৬৭৮৯";
export const toLatinDigits = (value: string) =>
  value
    .replace(/[০-৯]/g, (digit) => String(banglaDigits.indexOf(digit)))
    .replace(/[^0-9]/g, "");
export function DigitsOnlyInput({
  onChange,
  ...props
}: ComponentProps<"input">) {
  return (
    <input
      {...props}
      inputMode={props.inputMode ?? "numeric"}
      onChange={(event) => {
        event.currentTarget.value = toLatinDigits(event.currentTarget.value);
        onChange?.(event);
      }}
    />
  );
}

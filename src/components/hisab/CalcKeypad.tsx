"use client";
import { Delete } from "lucide-react";

export function CalcKeypad({
  disabled,
  onKey,
  onBackspace,
  backspaceLabel,
}: {
  disabled: boolean;
  onKey: (key: string) => void;
  onBackspace: () => void;
  backspaceLabel: string;
}) {
  return (
    <fieldset disabled={disabled} className="space-y-2">
      <div className="grid grid-cols-4 gap-2">
        {[
          "7",
          "8",
          "9",
          "/",
          "4",
          "5",
          "6",
          "*",
          "1",
          "2",
          "3",
          "-",
          "0",
          ".",
          "=",
          "+",
        ].map((key) => (
          <button
            type="button"
            key={key}
            onClick={() => onKey(key)}
            className="h-11 rounded border text-lg disabled:opacity-50"
          >
            {key === "/"
              ? "\u00f7"
              : key === "*"
                ? "\u00d7"
                : key === "-"
                  ? "\u2212"
                  : key}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onBackspace}
        aria-label={backspaceLabel}
        title={backspaceLabel}
        className="grid size-11 place-items-center rounded border disabled:opacity-50"
      >
        <Delete className="size-5" />
      </button>
    </fieldset>
  );
}

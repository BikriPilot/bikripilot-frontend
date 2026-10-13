"use client";

import { useState, useId, type InputHTMLAttributes } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";

export function isPasswordSecure(password: string): boolean {
  if (!password || password.length < 8) return false;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return hasLetter && hasNumber && hasSpecial;
}

export interface PasswordFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
  showStrengthIndicator?: boolean;
}

export function PasswordField({
  label,
  error,
  showStrengthIndicator = false,
  value = "",
  onChange,
  className = "",
  autoComplete = "current-password",
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  const passwordVal = typeof value === "string" ? value : "";

  const hasMinLength = passwordVal.length >= 8;
  const hasLetter = /[A-Za-z]/.test(passwordVal);
  const hasNumber = /[0-9]/.test(passwordVal);
  const hasSpecial = /[^A-Za-z0-9]/.test(passwordVal);

  const criteriaCount = [
    hasMinLength,
    hasLetter,
    hasNumber,
    hasSpecial,
  ].filter(Boolean).length;

  return (
    <div className="grid gap-1.5 text-sm font-medium">
      <label htmlFor={id} className="text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className={`h-11 w-full rounded-lg border bg-card pl-3 pr-11 text-base outline-none placeholder:text-muted-foreground focus:border-primary ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-0 top-0 grid h-11 w-11 place-items-center text-muted-foreground hover:text-foreground focus:outline-none"
          tabIndex={-1}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error ? <span className="text-xs text-danger">{error}</span> : null}

      {showStrengthIndicator && passwordVal.length > 0 && (
        <div className="mt-2 space-y-2 rounded-xl border bg-muted/20 p-3 text-xs">
          {/* Strength Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
              <span>Password strength</span>
              <span>
                {criteriaCount === 4
                  ? "Strong"
                  : criteriaCount >= 2
                    ? "Medium"
                    : "Weak"}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 h-1.5">
              <div
                className={`rounded-full transition-colors ${
                  criteriaCount >= 1 ? "bg-red-500" : "bg-muted"
                }`}
              />
              <div
                className={`rounded-full transition-colors ${
                  criteriaCount >= 2 ? "bg-amber-500" : "bg-muted"
                }`}
              />
              <div
                className={`rounded-full transition-colors ${
                  criteriaCount >= 3 ? "bg-emerald-400" : "bg-muted"
                }`}
              />
              <div
                className={`rounded-full transition-colors ${
                  criteriaCount === 4 ? "bg-emerald-600" : "bg-muted"
                }`}
              />
            </div>
          </div>

          {/* Checklist */}
          <ul className="space-y-1 pt-1 text-[11px]">
            <li
              className={`flex items-center gap-1.5 ${
                hasMinLength
                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {hasMinLength ? (
                <Check size={13} className="shrink-0 stroke-[2.5]" />
              ) : (
                <X size={13} className="shrink-0 text-muted-foreground/50" />
              )}
              <span>At least 8 characters (কমপক্ষে ৮টি অক্ষর)</span>
            </li>
            <li
              className={`flex items-center gap-1.5 ${
                hasLetter
                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {hasLetter ? (
                <Check size={13} className="shrink-0 stroke-[2.5]" />
              ) : (
                <X size={13} className="shrink-0 text-muted-foreground/50" />
              )}
              <span>Contains a letter (কমপক্ষে ১টি অক্ষর)</span>
            </li>
            <li
              className={`flex items-center gap-1.5 ${
                hasNumber
                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {hasNumber ? (
                <Check size={13} className="shrink-0 stroke-[2.5]" />
              ) : (
                <X size={13} className="shrink-0 text-muted-foreground/50" />
              )}
              <span>Contains a number (কমপক্ষে ১টি সংখ্যা)</span>
            </li>
            <li
              className={`flex items-center gap-1.5 ${
                hasSpecial
                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {hasSpecial ? (
                <Check size={13} className="shrink-0 stroke-[2.5]" />
              ) : (
                <X size={13} className="shrink-0 text-muted-foreground/50" />
              )}
              <span>
                Contains a special character (@, #, $, %, !, &)
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

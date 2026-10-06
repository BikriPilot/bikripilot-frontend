"use client";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
export function Field({
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      <span>{label}</span>
      <input
        {...props}
        className="h-11 rounded-lg border bg-card px-3 text-base outline-none placeholder:text-muted-foreground focus:border-primary"
      />
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  );
}
export function TextField({
  label,
  error,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      <span>{label}</span>
      <textarea
        {...props}
        className="min-h-28 rounded-lg border bg-card px-3 py-2 text-base outline-none placeholder:text-muted-foreground focus:border-primary"
      />
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  );
}

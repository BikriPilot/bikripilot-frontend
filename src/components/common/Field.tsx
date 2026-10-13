"use client";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  error,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label className="grid min-w-0 gap-1.5 text-sm font-medium">
      <span className="truncate">{label}</span>
      <input
        {...props}
        className={cn(
          "h-11 w-full min-w-0 rounded-lg border bg-card px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary",
          className,
        )}
      />
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  );
}

export function TextField({
  label,
  error,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
}) {
  return (
    <label className="grid min-w-0 gap-1.5 text-sm font-medium">
      <span className="truncate">{label}</span>
      <textarea
        {...props}
        className={cn(
          "min-h-28 w-full min-w-0 rounded-lg border bg-card px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary",
          className,
        )}
      />
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  );
}

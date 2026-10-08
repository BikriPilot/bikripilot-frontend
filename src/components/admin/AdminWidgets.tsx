"use client";

import { useState } from "react";
import { RefreshCw, Search, X } from "lucide-react";

export interface AdminColumn<T> {
  key: string;
  label: string;
  value: (row: T) => React.ReactNode;
}

export interface AdminField {
  key: string;
  label: string;
  type?:
    "text" | "textarea" | "number" | "boolean" | "select" | "date" | "json";
  required?: boolean;
  options?: { value: string; label: string }[];
  initialValue?: unknown;
  hint?: string;
}

export function AdminPageLoading() {
  return (
    <div aria-busy="true" className="space-y-6">
      <div className="h-8 w-56 animate-pulse rounded bg-muted" />
      <div className="h-4 w-96 max-w-full animate-pulse rounded bg-muted" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-md border bg-card"
          />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-md border bg-card" />
    </div>
  );
}

export function AdminTable<T extends object>({
  rows,
  columns,
  empty,
  rowKey,
  rowActions,
}: {
  rows: T[];
  columns: AdminColumn<T>[];
  empty: string;
  rowKey: (row: T) => string;
  rowActions?: (row: T) => React.ReactNode;
}) {
  if (!rows.length)
    return (
      <div className="grid min-h-40 place-items-center border border-dashed p-6 text-center text-sm text-muted-foreground">
        {empty}
      </div>
    );
  return (
    <>
      <div className="hidden overflow-x-auto border md:block">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-muted/70 text-xs text-muted-foreground">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-3 py-3 font-semibold">
                  {column.label}
                </th>
              ))}
              {rowActions ? <th className="w-24 px-3 py-3" /> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                className="border-t align-top hover:bg-muted/30"
              >
                {columns.map((column) => (
                  <td key={column.key} className="max-w-72 px-3 py-3">
                    {column.value(row)}
                  </td>
                ))}
                {rowActions ? (
                  <td className="px-3 py-2 text-right">{rowActions(row)}</td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-2 md:hidden">
        {rows.map((row) => (
          <article key={rowKey(row)} className="space-y-3 border bg-card p-3">
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              {columns.map((column) => (
                <div key={column.key} className="min-w-0">
                  <dt className="text-[11px] text-muted-foreground">
                    {column.label}
                  </dt>
                  <dd className="break-words">{column.value(row)}</dd>
                </div>
              ))}
            </dl>
            {rowActions ? (
              <div className="flex flex-wrap gap-2 border-t pt-2">
                {rowActions(row)}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </>
  );
}

export function AdminDialog({
  title,
  fields,
  submitLabel,
  closeLabel,
  cancelLabel,
  busy,
  error,
  onClose,
  onSubmit,
}: {
  title: string;
  fields: AdminField[];
  submitLabel: string;
  closeLabel: string;
  cancelLabel: string;
  busy?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>) => void;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(() =>
    Object.fromEntries(
      fields.map((field) => [
        field.key,
        field.initialValue ?? (field.type === "boolean" ? false : ""),
      ]),
    ),
  );
  const setValue = (key: string, value: unknown) =>
    setValues((current) => ({ ...current, [key]: value }));

  return (
    <div
      className="fixed inset-0 z-[70] grid items-end bg-foreground/40 p-0 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[92dvh] w-full overflow-y-auto border bg-card p-5 shadow-xl sm:mx-auto sm:max-w-xl"
      >
        <header className="mb-5 flex items-start justify-between gap-3 border-b pb-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-md hover:bg-muted"
            aria-label={closeLabel}
          >
            <X size={17} />
          </button>
        </header>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(values);
          }}
          className="space-y-4"
        >
          {fields.map((field) => (
            <label key={field.key} className="block space-y-1.5 text-sm">
              <span className="font-medium">
                {field.label}
                {field.required ? " *" : ""}
              </span>
              {field.type === "boolean" ? (
                <input
                  type="checkbox"
                  checked={Boolean(values[field.key])}
                  onChange={(event) =>
                    setValue(field.key, event.target.checked)
                  }
                  className="size-5 accent-primary"
                />
              ) : field.type === "select" ? (
                <select
                  required={field.required}
                  value={String(values[field.key] ?? "")}
                  onChange={(event) => setValue(field.key, event.target.value)}
                  className="min-h-11 w-full rounded-md border bg-background px-3"
                >
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field.type === "textarea" || field.type === "json" ? (
                <textarea
                  required={field.required}
                  rows={field.type === "json" ? 5 : 3}
                  value={
                    typeof values[field.key] === "string"
                      ? String(values[field.key])
                      : JSON.stringify(values[field.key] ?? "", null, 2)
                  }
                  onChange={(event) => setValue(field.key, event.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 font-mono text-sm"
                />
              ) : (
                <input
                  required={field.required}
                  type={field.type ?? "text"}
                  value={String(values[field.key] ?? "")}
                  onChange={(event) =>
                    setValue(
                      field.key,
                      field.type === "number"
                        ? event.target.value === ""
                          ? ""
                          : Number(event.target.value)
                        : event.target.value,
                    )
                  }
                  className="min-h-11 w-full rounded-md border bg-background px-3"
                />
              )}
              {field.hint ? (
                <span className="block text-xs text-muted-foreground">
                  {field.hint}
                </span>
              ) : null}
            </label>
          ))}
          {error ? (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          ) : null}
          <div className="flex justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-md border px-4 text-sm"
            >
              {cancelLabel}
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {busy ? <RefreshCw className="animate-spin" size={15} /> : null}
              {submitLabel}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export function AdminSearch({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative block min-w-0 flex-1 sm:max-w-sm">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-11 w-full rounded-md border bg-background pl-9 pr-3 text-sm"
      />
    </label>
  );
}

export function AdminStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: React.ReactNode;
  detail?: string;
}) {
  return (
    <article className="min-w-0 border-l-2 border-primary bg-card px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-2xl font-semibold tabular-nums">
        {value}
      </p>
      {detail ? (
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      ) : null}
    </article>
  );
}

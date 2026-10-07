"use client";

import { useState } from "react";
import { FileUp } from "lucide-react";
import { useTranslations } from "next-intl";

export function PayoutCsvImport({
  busy,
  onImport,
}: {
  busy: boolean;
  onImport: (file: File) => void;
}) {
  const t = useTranslations("reconciliation");
  const [file, setFile] = useState<File | null>(null);
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t("csvDescription")}</p>
      <label className="flex min-h-12 cursor-pointer items-center gap-3 border border-dashed px-3 text-sm hover:bg-muted/30">
        <FileUp size={18} className="shrink-0 text-muted-foreground" />
        <span className="min-w-0 truncate">
          {file ? t("selectedFile", { name: file.name }) : t("selectFile")}
        </span>
        <input
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          onChange={(event) => setFile(event.currentTarget.files?.[0] ?? null)}
        />
      </label>
      <div className="flex justify-end">
        <button
          type="button"
          disabled={!file || busy}
          onClick={() => file && onImport(file)}
          className="min-h-10 bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {t("importPayout")}
        </button>
      </div>
    </div>
  );
}

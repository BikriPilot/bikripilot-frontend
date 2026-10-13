"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Code2, LayoutList, Sparkles, AlertCircle } from "lucide-react";

export interface ModelPricingItem {
  inputPerMillionUsd: number;
  outputPerMillionUsd: number;
}

export type AiPricingMap = Record<string, ModelPricingItem>;

interface AiPricingSettingEditorProps {
  value: unknown;
  onChange: (value: AiPricingMap) => void;
  disabled?: boolean;
}

const POPULAR_PRESETS: Array<{
  name: string;
  key: string;
  input: number;
  output: number;
}> = [
  { name: "Gemini 2.0 Flash", key: "gemini-2.0-flash", input: 0.1, output: 0.4 },
  { name: "Gemini 1.5 Flash", key: "gemini-1.5-flash", input: 0.075, output: 0.3 },
  { name: "Gemini 1.5 Pro", key: "gemini-1.5-pro", input: 1.25, output: 5.0 },
  { name: "GPT-4o Mini", key: "gpt-4o-mini", input: 0.15, output: 0.6 },
  { name: "GPT-4o", key: "gpt-4o", input: 2.5, output: 10.0 },
  { name: "Claude 3.5 Sonnet", key: "claude-3-5-sonnet-20241022", input: 3.0, output: 15.0 },
];

function normalizeValueToMap(val: unknown): AiPricingMap {
  if (!val) return {};
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (parsed && typeof parsed === "object") return parsed as AiPricingMap;
    } catch {
      return {};
    }
  }
  if (typeof val === "object" && !Array.isArray(val)) {
    return val as AiPricingMap;
  }
  return {};
}

export function AiPricingSettingEditor({
  value,
  onChange,
  disabled = false,
}: AiPricingSettingEditorProps) {
  const [mode, setMode] = useState<"visual" | "json">("visual");
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  // New model inputs
  const [newModelKey, setNewModelKey] = useState("");
  const [newInputPrice, setNewInputPrice] = useState("");
  const [newOutputPrice, setNewOutputPrice] = useState("");

  const currentMap = normalizeValueToMap(value);

  // Sync jsonText whenever value changes or mode switches
  useEffect(() => {
    try {
      setJsonText(JSON.stringify(currentMap, null, 2));
      setJsonError(null);
    } catch {
      // ignore
    }
  }, [value]);

  const handleUpdateModel = (
    key: string,
    field: "inputPerMillionUsd" | "outputPerMillionUsd",
    rawVal: string,
  ) => {
    const num = Number(rawVal);
    const updated: AiPricingMap = {
      ...currentMap,
      [key]: {
        inputPerMillionUsd:
          field === "inputPerMillionUsd"
            ? isNaN(num) ? 0 : num
            : currentMap[key]?.inputPerMillionUsd ?? 0,
        outputPerMillionUsd:
          field === "outputPerMillionUsd"
            ? isNaN(num) ? 0 : num
            : currentMap[key]?.outputPerMillionUsd ?? 0,
      },
    };
    onChange(updated);
  };

  const handleDeleteModel = (key: string) => {
    const updated = { ...currentMap };
    delete updated[key];
    onChange(updated);
  };

  const handleAddModel = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newModelKey.trim();
    if (!trimmed) return;

    const inputNum = parseFloat(newInputPrice) || 0;
    const outputNum = parseFloat(newOutputPrice) || 0;

    const updated: AiPricingMap = {
      ...currentMap,
      [trimmed]: {
        inputPerMillionUsd: inputNum,
        outputPerMillionUsd: outputNum,
      },
    };
    onChange(updated);
    setNewModelKey("");
    setNewInputPrice("");
    setNewOutputPrice("");
  };

  const handleApplyPreset = (preset: typeof POPULAR_PRESETS[number]) => {
    setNewModelKey(preset.key);
    setNewInputPrice(String(preset.input));
    setNewOutputPrice(String(preset.output));
  };

  const handleJsonChange = (text: string) => {
    setJsonText(text);
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        setJsonError(null);
        onChange(parsed as AiPricingMap);
      } else {
        setJsonError("JSON must be an object with model keys");
      }
    } catch (err) {
      setJsonError((err as Error).message);
    }
  };

  const modelEntries = Object.entries(currentMap);

  return (
    <div className="rounded-lg border bg-card/60 p-4 shadow-xs space-y-4">
      {/* Header with Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span className="font-semibold text-sm">AI মডেল প্রাইসিং ম্যাট্রিক্স</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              {modelEntries.length} টি মডেল কনফিগার করা
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            প্রতি ১ মিলিয়ন (1,000,000) ইনপুট ও আউটপুট টোকেনের খরচ ডলারে ($USD) নির্ধারণ করুন।
          </p>
        </div>

        <div className="flex items-center rounded-md border bg-muted/40 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setMode("visual")}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-medium transition-colors ${
              mode === "visual"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutList className="size-3.5" />
            ফর্ম ভিউ
          </button>
          <button
            type="button"
            onClick={() => setMode("json")}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-medium transition-colors ${
              mode === "json"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code2 className="size-3.5" />
            JSON কোড
          </button>
        </div>
      </div>

      {mode === "visual" ? (
        <div className="space-y-4">
          {/* Models Table */}
          {modelEntries.length === 0 ? (
            <div className="rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
              কোনো মডেল যোগ করা নেই। নিচের ফর্ম থেকে মডেল কোড এবং প্রাইস যোগ করুন।
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border bg-background/50">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-muted/70 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3.5 py-2.5 font-semibold">মডেলের নাম / কোড</th>
                    <th className="px-3.5 py-2.5 font-semibold">ইনপুট খরচ ($ / 1M)</th>
                    <th className="px-3.5 py-2.5 font-semibold">আউটপুট খরচ ($ / 1M)</th>
                    <th className="w-14 px-3.5 py-2.5 text-right font-semibold">মুছুন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {modelEntries.map(([modelKey, pricing]) => (
                    <tr key={modelKey} className="hover:bg-muted/20 transition-colors">
                      <td className="px-3.5 py-2.5 font-mono text-xs font-medium">
                        <span className="inline-block rounded bg-muted/60 px-2 py-1 text-foreground">
                          {modelKey}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <div className="relative inline-flex items-center max-w-[170px]">
                          <span className="absolute left-2.5 text-xs text-muted-foreground">$</span>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            disabled={disabled}
                            value={pricing.inputPerMillionUsd ?? 0}
                            onChange={(e) =>
                              handleUpdateModel(modelKey, "inputPerMillionUsd", e.target.value)
                            }
                            className="w-full rounded-md border bg-background pl-6 pr-12 py-1 text-xs font-mono focus:border-primary focus:outline-hidden"
                          />
                          <span className="absolute right-2 text-[10px] text-muted-foreground pointer-events-none">
                            / 1M
                          </span>
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5">
                        <div className="relative inline-flex items-center max-w-[170px]">
                          <span className="absolute left-2.5 text-xs text-muted-foreground">$</span>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            disabled={disabled}
                            value={pricing.outputPerMillionUsd ?? 0}
                            onChange={(e) =>
                              handleUpdateModel(modelKey, "outputPerMillionUsd", e.target.value)
                            }
                            className="w-full rounded-md border bg-background pl-6 pr-12 py-1 text-xs font-mono focus:border-primary focus:outline-hidden"
                          />
                          <span className="absolute right-2 text-[10px] text-muted-foreground pointer-events-none">
                            / 1M
                          </span>
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5 text-right">
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => handleDeleteModel(modelKey)}
                          title="মডেল রিমুভ করুন"
                          className="inline-flex size-7 items-center justify-center rounded-md border border-destructive/20 text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Quick Presets */}
          {!disabled && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-medium text-muted-foreground">
                কুইক প্রিসেট (ক্লিক করে অটো-পূরণ করুন):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="inline-flex items-center gap-1 rounded-md border bg-muted/30 px-2 py-0.5 text-[11px] font-medium hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
                  >
                    <span>{preset.name}</span>
                    <span className="text-muted-foreground text-[10px]">
                      (${preset.input}/${preset.output})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add New Model Form */}
          {!disabled && (
            <div className="rounded-md border bg-muted/20 p-3 space-y-2.5">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Plus className="size-3.5 text-primary" />
                নতুন মডেল যোগ করুন
              </span>

              <form onSubmit={handleAddModel} className="grid gap-2 sm:grid-cols-[1.5fr_1fr_1fr_auto] items-end">
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">মডেল কোড / নাম</label>
                  <input
                    type="text"
                    placeholder="e.g. gpt-4o বা gemini-2.0-flash"
                    value={newModelKey}
                    onChange={(e) => setNewModelKey(e.target.value)}
                    className="w-full rounded-md border bg-background px-2.5 py-1.5 text-xs font-mono focus:border-primary focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">ইনপুট $/1M (Input)</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-xs text-muted-foreground">$</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="e.g. 2"
                      value={newInputPrice}
                      onChange={(e) => setNewInputPrice(e.target.value)}
                      className="w-full rounded-md border bg-background pl-6 pr-2 py-1.5 text-xs font-mono focus:border-primary focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">আউটপুট $/1M (Output)</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-2.5 text-xs text-muted-foreground">$</span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="e.g. 10"
                      value={newOutputPrice}
                      onChange={(e) => setNewOutputPrice(e.target.value)}
                      className="w-full rounded-md border bg-background pl-6 pr-2 py-1.5 text-xs font-mono focus:border-primary focus:outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!newModelKey.trim()}
                  className="inline-flex min-h-[34px] items-center justify-center gap-1 rounded-md bg-primary px-3.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Plus className="size-3.5" />
                  মডেল যোগ করুন
                </button>
              </form>
            </div>
          )}

          {/* User Guide Box */}
          <div className="rounded-md border border-primary/20 bg-primary/5 p-2.5 text-[11px] text-muted-foreground flex items-start gap-2">
            <span className="text-primary font-bold">💡 নির্দেশিকা:</span>
            <span>
              আপনার মডেলের ইনপুট খরচ $2 এবং আউটপুট খরচ $10 হলে, ইনপুটে <strong className="text-foreground">2</strong> এবং আউটপুটে <strong className="text-foreground">10</strong> লিখবেন। 
              মডেলের নাম অবশ্যই backend বা AI প্রোভাইডারের সঠিক কোডনেইম (যেমন: <code className="text-primary font-mono">gemini-2.0-flash</code>, <code className="text-primary font-mono">gpt-4o</code>) হতে হবে।
            </span>
          </div>
        </div>
      ) : (
        /* Raw JSON Editor */
        <div className="space-y-2">
          {jsonError && (
            <div className="flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs text-destructive">
              <AlertCircle className="size-3.5" />
              <span>JSON এরর: {jsonError}</span>
            </div>
          )}
          <textarea
            disabled={disabled}
            rows={7}
            value={jsonText}
            onChange={(e) => handleJsonChange(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 font-mono text-xs focus:border-primary focus:outline-hidden"
            placeholder='{\n  "gpt-4o": {\n    "inputPerMillionUsd": 2,\n    "outputPerMillionUsd": 10\n  }\n}'
          />
          <p className="text-[11px] text-muted-foreground">
            সরাসরি JSON অবজেক্ট সম্পাদনা করুন। পরিবর্তন সাথে সাথে সেভ ড্রাফটে আপডেট হবে।
          </p>
        </div>
      )}
    </div>
  );
}

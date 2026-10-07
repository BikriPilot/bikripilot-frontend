'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Save,
  Lock,
  Sparkles,
  ShieldAlert,
  Sliders,
  Bot,
  X,
  Plus,
} from 'lucide-react';
import { useAiSettings, useUpdateAiSettings, useAiReadiness } from '@/hooks/queries/useAi';
import { useCurrentShop } from '@/hooks/useCurrentShop';
import type {
  AiReadinessDTO,
  AiReplyLanguage,
  AiReplyMode,
  AiSettingsDTO,
  AiTone,
  UpdateAiSettingsInput,
} from '@/types/ai';

interface FormContentProps {
  settings: AiSettingsDTO;
  readiness?: AiReadinessDTO;
}

function AiSettingsFormContent({ settings, readiness }: FormContentProps) {
  const t = useTranslations('ai');
  const { can } = useCurrentShop();
  const updateMutation = useUpdateAiSettings();

  const hasAutoReplyEntitlement = can('ai.manage');
  const isReadyForAuto = Boolean(readiness?.ready);
  const canSelectAuto = hasAutoReplyEntitlement && isReadyForAuto;

  const [replyMode, setReplyMode] = useState<AiReplyMode>(settings.replyMode);
  const [tone, setTone] = useState<AiTone>(settings.tone);
  const [replyLanguage, setReplyLanguage] = useState<AiReplyLanguage>(settings.replyLanguage);
  const [revealPrice, setRevealPrice] = useState(settings.revealPrice);
  const [greetingText, setGreetingText] = useState(settings.greetingText ?? '');
  const [customInstructions, setCustomInstructions] = useState(settings.customInstructions ?? '');
  const [handoffKeywords, setHandoffKeywords] = useState<string[]>(settings.handoffKeywords ?? []);
  const [keywordInput, setKeywordInput] = useState('');
  const [humanPauseMinutes, setHumanPauseMinutes] = useState(settings.humanPauseMinutes);
  const [minConfidence, setMinConfidence] = useState(settings.minConfidence);
  const [autoCreateDraftOrder, setAutoCreateDraftOrder] = useState(settings.autoCreateDraftOrder);
  const [commentAiEnabled, setCommentAiEnabled] = useState(settings.commentAiEnabled);
  const [maxDailyReplies, setMaxDailyReplies] = useState(settings.maxAutoRepliesPerConversationPerDay);

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim();
    if (!trimmed) return;
    if (handoffKeywords.includes(trimmed)) {
      setKeywordInput('');
      return;
    }
    setHandoffKeywords([...handoffKeywords, trimmed]);
    setKeywordInput('');
  };

  const handleRemoveKeyword = (kw: string) => {
    setHandoffKeywords(handoffKeywords.filter((k) => k !== kw));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: UpdateAiSettingsInput = {
      replyMode,
      tone,
      replyLanguage,
      revealPrice,
      greetingText: greetingText.trim() ? greetingText.trim() : null,
      customInstructions: customInstructions.trim() ? customInstructions.trim() : null,
      handoffKeywords,
      humanPauseMinutes: Number(humanPauseMinutes) || 30,
      minConfidence: Number(minConfidence) || 0.7,
      autoCreateDraftOrder,
      commentAiEnabled,
      maxAutoRepliesPerConversationPerDay: Number(maxDailyReplies) || 10,
    };

    try {
      await updateMutation.mutateAsync(payload);
      toast.success(t('settingsSaved'));
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('failedToSaveSettings');
      toast.error(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {t('settingsTitle')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('settingsSubtitle')}
          </p>
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save className="size-4" />
          <span>{updateMutation.isPending ? t('saving') : t('saveChanges')}</span>
        </button>
      </div>

      {/* Mode Selection Cards */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Bot className="size-5 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            {t('replyModeTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* OFF */}
          <div
            onClick={() => setReplyMode('OFF')}
            className={`cursor-pointer rounded-xl border p-4 transition-all ${
              replyMode === 'OFF'
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-border hover:border-muted-foreground/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">{t('modeOff')}</span>
              <input
                type="radio"
                name="replyMode"
                checked={replyMode === 'OFF'}
                onChange={() => setReplyMode('OFF')}
                className="text-primary"
              />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('modeOffDesc')}
            </p>
          </div>

          {/* DRAFT */}
          <div
            onClick={() => setReplyMode('DRAFT')}
            className={`cursor-pointer rounded-xl border p-4 transition-all ${
              replyMode === 'DRAFT'
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-border hover:border-muted-foreground/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">{t('modeDraft')}</span>
              <input
                type="radio"
                name="replyMode"
                checked={replyMode === 'DRAFT'}
                onChange={() => setReplyMode('DRAFT')}
                className="text-primary"
              />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('modeDraftDesc')}
            </p>
          </div>

          {/* AUTO */}
          <div
            onClick={() => {
              if (canSelectAuto) {
                setReplyMode('AUTO');
              } else if (!isReadyForAuto) {
                toast.warning(t('completeReadinessFirst'));
              }
            }}
            className={`relative rounded-xl border p-4 transition-all ${
              replyMode === 'AUTO'
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20 cursor-pointer'
                : canSelectAuto
                ? 'border-border hover:border-muted-foreground/30 cursor-pointer'
                : 'border-border bg-muted/30 opacity-70 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm">{t('modeAuto')}</span>
                {!canSelectAuto && <Lock className="size-3.5 text-muted-foreground" />}
              </div>
              <input
                type="radio"
                name="replyMode"
                checked={replyMode === 'AUTO'}
                disabled={!canSelectAuto}
                onChange={() => canSelectAuto && setReplyMode('AUTO')}
                className="text-primary"
              />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('modeAutoDesc')}
            </p>
            {!canSelectAuto && (
              <span className="mt-2 inline-block text-[11px] font-medium text-amber-600 dark:text-amber-400">
                {!isReadyForAuto ? t('readinessIncomplete') : t('planUpgradeRequired')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Personality & Tone */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            {t('voiceAndToneTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">
              {t('toneLabel')}
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as AiTone)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            >
              <option value="FRIENDLY">{t('toneFriendly')}</option>
              <option value="FORMAL">{t('toneFormal')}</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">
              {t('replyLanguageLabel')}
            </label>
            <select
              value={replyLanguage}
              onChange={(e) => setReplyLanguage(e.target.value as AiReplyLanguage)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            >
              <option value="AUTO">{t('langAuto')}</option>
              <option value="BANGLA">{t('langBangla')}</option>
              <option value="BANGLISH">{t('langBanglish')}</option>
              <option value="ENGLISH">{t('langEnglish')}</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <label className="text-xs font-medium text-foreground block mb-1.5">
            {t('greetingLabel')}
          </label>
          <input
            type="text"
            value={greetingText}
            onChange={(e) => setGreetingText(e.target.value)}
            placeholder={t('greetingPlaceholder')}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="pt-2">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-foreground">
              {t('customInstructionsLabel')}
            </label>
            <span className="text-xs font-mono text-muted-foreground">
              {customInstructions.length} / 1000
            </span>
          </div>
          <textarea
            value={customInstructions}
            maxLength={1000}
            onChange={(e) => setCustomInstructions(e.target.value)}
            placeholder={t('customInstructionsPlaceholder')}
            rows={4}
            className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Safety & Guardrails */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-5 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            {t('safetyAndGuardrailsTitle')}
          </h2>
        </div>

        {/* Reveal Price Toggle */}
        <label className="flex items-center justify-between gap-4 p-3 rounded-xl border border-border hover:bg-muted/30 cursor-pointer transition-colors">
          <div>
            <div className="text-sm font-medium text-foreground">
              {t('revealPriceToggle')}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {t('revealPriceToggleDesc')}
            </div>
          </div>
          <input
            type="checkbox"
            checked={revealPrice}
            onChange={(e) => setRevealPrice(e.target.checked)}
            className="size-4 rounded text-primary focus:ring-primary"
          />
        </label>

        {/* Confidence Slider */}
        <div className="p-3 rounded-xl border border-border space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-foreground">
                {t('minConfidenceLabel')}
              </span>
              <p className="text-xs text-muted-foreground">
                {t('minConfidenceDesc')}
              </p>
            </div>
            <span className="text-sm font-mono font-bold text-primary">
              {Math.round(minConfidence * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="0.95"
            step="0.05"
            value={minConfidence}
            onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        {/* Human Pause Minutes & Daily Cap */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">
              {t('humanPauseLabel')}
            </label>
            <input
              type="number"
              min="1"
              max="1440"
              value={humanPauseMinutes}
              onChange={(e) => setHumanPauseMinutes(parseInt(e.target.value, 10) || 30)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
            <span className="text-[11px] text-muted-foreground mt-1 block">
              {t('humanPauseHelp')}
            </span>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">
              {t('dailyCapLabel')}
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={maxDailyReplies}
              onChange={(e) => setMaxDailyReplies(parseInt(e.target.value, 10) || 10)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
            <span className="text-[11px] text-muted-foreground mt-1 block">
              {t('dailyCapHelp')}
            </span>
          </div>
        </div>

        {/* Handoff Keywords */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-medium text-foreground block">
            {t('handoffKeywordsLabel')}
          </label>
          <p className="text-xs text-muted-foreground">
            {t('handoffKeywordsDesc')}
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddKeyword();
                }
              }}
              placeholder={t('addKeywordPlaceholder')}
              className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={handleAddKeyword}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-input bg-background px-3 text-xs font-semibold hover:bg-muted"
            >
              <Plus className="size-4" />
              <span>{t('add')}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {handoffKeywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
              >
                <span>{kw}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(kw)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Automation Toggles */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="size-5 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            {t('automationOptionsTitle')}
          </h2>
        </div>

        {/* Auto create draft order */}
        <label className="flex items-center justify-between gap-4 p-3 rounded-xl border border-border hover:bg-muted/30 cursor-pointer transition-colors">
          <div>
            <div className="text-sm font-medium text-foreground">
              {t('autoCreateDraftOrder')}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {t('autoCreateDraftOrderDesc')}
            </div>
          </div>
          <input
            type="checkbox"
            checked={autoCreateDraftOrder}
            onChange={(e) => setAutoCreateDraftOrder(e.target.checked)}
            className="size-4 rounded text-primary focus:ring-primary"
          />
        </label>

        {/* Comment AI */}
        <label className="flex items-center justify-between gap-4 p-3 rounded-xl border border-border hover:bg-muted/30 cursor-pointer transition-colors">
          <div>
            <div className="text-sm font-medium text-foreground">
              {t('commentAiEnabled')}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {t('commentAiEnabledDesc')}
            </div>
          </div>
          <input
            type="checkbox"
            checked={commentAiEnabled}
            onChange={(e) => setCommentAiEnabled(e.target.checked)}
            className="size-4 rounded text-primary focus:ring-primary"
          />
        </label>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save className="size-4" />
          <span>{updateMutation.isPending ? t('saving') : t('saveChanges')}</span>
        </button>
      </div>
    </form>
  );
}

export function AiSettingsForm() {
  const { data: settings, isLoading } = useAiSettings();
  const { data: readiness } = useAiReadiness();

  if (isLoading || !settings) {
    return (
      <div className="space-y-6 animate-pulse max-w-4xl">
        <div className="h-8 w-48 rounded-md bg-muted" />
        <div className="space-y-4">
          <div className="h-44 rounded-2xl bg-muted/60" />
          <div className="h-72 rounded-2xl bg-muted/60" />
        </div>
      </div>
    );
  }

  return (
    <AiSettingsFormContent
      key={settings.replyMode + (settings.greetingText ?? '')}
      settings={settings}
      readiness={readiness}
    />
  );
}

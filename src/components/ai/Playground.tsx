'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Send,
  RotateCcw,
  Bot,
  User,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Sparkles,
  Package,
} from 'lucide-react';
import { usePlayground } from '@/hooks/queries/useAi';
import type { AiDraftDTO } from '@/types/ai';

interface ChatMessage {
  id: string;
  role: 'customer' | 'shop';
  text: string;
  draft?: AiDraftDTO;
}

const SAMPLE_QUESTIONS = [
  'দাম কত?',
  'Delivery charge koto?',
  'Cash on delivery hobe?',
  'Panjabi koto?',
  'Mirpur delivery koto din lagbe?',
];

export function Playground() {
  const t = useTranslations('ai');
  const playgroundMutation = usePlayground();
  const counterRef = useRef(0);

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastDraft, setLastDraft] = useState<AiDraftDTO | null>(null);

  const handleSend = async (messageToSend?: string) => {
    const text = (messageToSend ?? inputMessage).trim();
    if (!text || playgroundMutation.isPending) return;

    counterRef.current += 1;
    const customerMsg: ChatMessage = {
      id: `cust-${counterRef.current}`,
      role: 'customer',
      text,
    };

    const newMessages = [...messages, customerMsg];
    setMessages(newMessages);
    setInputMessage('');

    // Prepare history
    const history = messages.map((m) => ({
      role: m.role,
      text: m.text,
    }));

    try {
      const draftResult = await playgroundMutation.mutateAsync({
        message: text,
        history,
      });

      setLastDraft(draftResult);

      counterRef.current += 1;
      const aiMsg: ChatMessage = {
        id: `ai-${counterRef.current}`,
        role: 'shop',
        text: draftResult.text ?? t('noReplyGenerated'),
        draft: draftResult,
      };

      setMessages([...newMessages, aiMsg]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('playgroundError');
      toast.error(msg);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setLastDraft(null);
    setInputMessage('');
    toast.info(t('playgroundReset'));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {t('playgroundTitle')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('playgroundSubtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          disabled={messages.length === 0}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-input bg-background px-3 text-xs font-semibold hover:bg-muted disabled:opacity-40 transition-colors"
        >
          <RotateCcw className="size-4" />
          <span>{t('clearHistory')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Chat Simulator Pane */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs flex flex-col h-[600px]">
          <div className="flex items-center justify-between pb-3 border-b border-border text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {t('chatSimulator')}
            </span>
            <span>{t('simulatorLiveBadge')}</span>
          </div>

          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <Bot className="size-8" />
                </div>
                <div className="max-w-sm space-y-1">
                  <h3 className="text-sm font-semibold text-foreground">
                    {t('testYourAssistant')}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t('testYourAssistantDesc')}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center max-w-md pt-2">
                  {SAMPLE_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => void handleSend(q)}
                      className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs text-foreground hover:bg-muted transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 ${
                    m.role === 'customer' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {m.role === 'shop' && (
                    <div className="p-1.5 rounded-xl bg-primary/10 text-primary size-7 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="size-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === 'customer'
                        ? 'bg-primary text-primary-foreground rounded-tr-xs'
                        : m.draft?.status === 'BLOCKED'
                        ? 'bg-destructive/10 border border-destructive/20 text-destructive rounded-tl-xs'
                        : 'bg-muted/70 text-foreground border border-border/50 rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    {m.draft && (
                      <div className="mt-2 pt-2 border-t border-border/30 flex items-center gap-2 flex-wrap text-[11px] opacity-80">
                        {m.draft.intent && (
                          <span className="font-semibold">
                            {m.draft.intent}
                          </span>
                        )}
                        {m.draft.confidence !== null && (
                          <span>
                            • {Math.round(m.draft.confidence * 100)}% {t('confidence')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {m.role === 'customer' && (
                    <div className="p-1.5 rounded-xl bg-muted text-muted-foreground size-7 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="size-4" />
                    </div>
                  )}
                </div>
              ))
            )}

            {playgroundMutation.isPending && (
              <div className="flex gap-3 justify-start items-center text-xs text-muted-foreground animate-pulse">
                <div className="p-1.5 rounded-xl bg-primary/10 text-primary size-7 flex items-center justify-center shrink-0">
                  <Bot className="size-4" />
                </div>
                <div className="rounded-2xl bg-muted px-4 py-2">
                  {t('aiGeneratingReply')}
                </div>
              </div>
            )}
          </div>

          {/* Quick presets while chatting */}
          {messages.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto py-2 scrollbar-none border-t border-border">
              {SAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => void handleSend(q)}
                  className="rounded-lg bg-muted/60 px-2.5 py-1 text-[11px] whitespace-nowrap text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
            className="flex gap-2 pt-2 border-t border-border"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={t('playgroundInputPlaceholder')}
              disabled={playgroundMutation.isPending}
              className="flex-1 rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || playgroundMutation.isPending}
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Send className="size-4" />
              <span>{t('send')}</span>
            </button>
          </form>
        </div>

        {/* Inspection / Guardrail Results Pane */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Sparkles className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              {t('guardrailInspection')}
            </h2>
          </div>

          {lastDraft ? (
            <div className="space-y-4">
              {/* Status */}
              <div>
                <span className="text-xs text-muted-foreground block mb-1">
                  {t('runStatus')}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    lastDraft.status === 'SUCCESS'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : lastDraft.status === 'BLOCKED'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {lastDraft.status === 'SUCCESS' ? (
                    <ShieldCheck className="size-3.5" />
                  ) : (
                    <ShieldAlert className="size-3.5" />
                  )}
                  <span>{lastDraft.status}</span>
                </span>
              </div>

              {/* Intent */}
              <div>
                <span className="text-xs text-muted-foreground block mb-1">
                  {t('detectedIntent')}
                </span>
                <span className="inline-block rounded-md bg-muted px-2.5 py-1 text-xs font-mono font-medium text-foreground">
                  {lastDraft.intent ?? 'NONE'}
                </span>
              </div>

              {/* Confidence */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{t('confidence')}</span>
                  <span className="font-mono font-bold text-foreground">
                    {lastDraft.confidence !== null
                      ? `${Math.round(lastDraft.confidence * 100)}%`
                      : 'N/A'}
                  </span>
                </div>
                {lastDraft.confidence !== null && (
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.round(lastDraft.confidence * 100)}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Needs Human & Handoff */}
              <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('needsHuman')}</span>
                  <span
                    className={`font-semibold ${
                      lastDraft.needsHuman ? 'text-amber-600' : 'text-emerald-600'
                    }`}
                  >
                    {lastDraft.needsHuman ? t('yes') : t('no')}
                  </span>
                </div>

                {lastDraft.handoffReason && (
                  <div>
                    <span className="text-muted-foreground block">
                      {t('handoffReason')}:
                    </span>
                    <span className="font-medium text-amber-700 dark:text-amber-400">
                      {lastDraft.handoffReason}
                    </span>
                  </div>
                )}

                {lastDraft.blockedReason && (
                  <div className="pt-1 text-destructive flex items-start gap-1.5">
                    <AlertTriangle className="size-3.5 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">{t('blockedReason')}:</span>
                      <p className="mt-0.5">{lastDraft.blockedReason}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Products Referenced */}
              <div>
                <span className="text-xs text-muted-foreground block mb-1.5">
                  {t('referencedProducts')}
                </span>
                {lastDraft.productIds.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {lastDraft.productIds.map((pid) => (
                      <span
                        key={pid}
                        className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary font-mono"
                      >
                        <Package className="size-3" />
                        <span>{pid}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic">
                    {t('noProductsReferenced')}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-muted-foreground">
              {t('sendPromptToInspect')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

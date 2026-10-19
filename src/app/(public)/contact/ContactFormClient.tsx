"use client";

import { useState, useRef, DragEvent, ChangeEvent, FormEvent } from "react";
import { useLocale } from "next-intl";
import {
  Send,
  UploadCloud,
  FileImage,
  FileVideo,
  X,
  CheckCircle2,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { publicApi } from "@/lib/api/public.api";

interface ContactTranslations {
  contactFormTitle: string;
  contactFormDesc: string;
  contactNameLabel: string;
  contactEmailLabel: string;
  contactPhoneLabel: string;
  contactTopicLabel: string;
  contactMessageLabel: string;
  contactAttachLabel: string;
  contactAttachDesc: string;
  contactSubmitBtn: string;
  contactSendingBtn: string;
  contactSuccessTitle: string;
  contactSuccessDesc: string;
  contactTicketAssigned: string;
  contactSendAnother: string;
  contactGeneralInquiry: string;
  contactPageSetup: string;
  contactCourierSync: string;
  contactBillingPlan: string;
  contactBugIssue: string;
}

export function ContactFormClient({ t }: { t: ContactTranslations }) {
  const locale = useLocale();
  const isBn = locale === "bn";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState("general");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successTicket, setSuccessTicket] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // File size limit: 25MB
  const MAX_FILE_SIZE = 25 * 1024 * 1024;

  const isFormValid = Boolean(
    fullName.trim().length >= 2 &&
      /^\S+@\S+\.\S+$/.test(email.trim()) &&
      phone.trim().length >= 8 &&
      message.trim().length >= 5
  );

  const handleFiles = (incomingFiles: FileList | null) => {
    if (!incomingFiles || incomingFiles.length === 0) return;

    const validFiles: File[] = [];
    for (let i = 0; i < incomingFiles.length; i++) {
      const file = incomingFiles[i];
      if (file.size > MAX_FILE_SIZE) {
        toast.error(
          isBn
            ? `"${file.name}" ফাইলের সাইজ ২৫ মেগাবাইটের বেশি।`
            : `"${file.name}" exceeds the 25MB size limit.`
        );
        continue;
      }
      validFiles.push(file);
    }

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (e.target) e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + " KB";
    }
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || fullName.trim().length < 2) {
      toast.error(
        isBn
          ? "অনুগ্রহ করে আপনার পুরো নাম লিখুন।"
          : "Please provide your full name."
      );
      return;
    }

    // Validation: email and phone are mandatory
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      toast.error(
        isBn
          ? "অনুগ্রহ করে একটি সঠিক ইমেইল অ্যাড্রেস লিখুন।"
          : "Please provide a valid email address."
      );
      return;
    }

    if (!phone.trim() || phone.trim().length < 8) {
      toast.error(
        isBn
          ? "অনুগ্রহ করে একটি সঠিক ফোন বা হোয়াটসঅ্যাপ নম্বর দিন (কমপক্ষে ৮ ডিজিট)।"
          : "Please provide a valid phone or WhatsApp number (at least 8 digits)."
      );
      return;
    }

    if (!message.trim() || message.trim().length < 5) {
      toast.error(
        isBn
          ? "অনুগ্রহ করে আপনার প্রশ্ন বা বার্তা বিস্তারিত লিখুন।"
          : "Please write a detailed message explaining your question or issue."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", fullName.trim());
      formData.append("email", email.trim().toLowerCase());
      formData.append("phone", phone.trim());
      formData.append("topic", topic.trim());
      formData.append("message", message.trim());
      for (const file of files) {
        formData.append("attachments", file);
      }

      const res = await publicApi.submitContact(formData);
      toast.success(
        isBn
          ? "আপনার বার্তা সফলভাবে পাঠানো হয়েছে!"
          : "Your message has been sent successfully!"
      );
      setSuccessTicket(res.ticketNumber);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error && err.message
          ? err.message
          : isBn
            ? "মেসেজ পাঠানো সম্ভব হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন বা সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করুন।"
            : "Failed to send message. Please try again or reach us via WhatsApp directly.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setTopic("general");
    setMessage("");
    setFiles([]);
    setSuccessTicket(null);
  };

  if (successTicket) {
    return (
      <div className="rounded-2xl border border-border/80 bg-card p-7 sm:p-9 shadow-sm animate-in fade-in-50 duration-300">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 mb-5">
          <CheckCircle2 className="size-8" />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          Ticket #{successTicket}
        </span>
        <h3 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
          {t.contactSuccessTitle}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t.contactSuccessDesc}{" "}
          <strong className="text-foreground">#{successTicket}</strong>.{" "}
          {t.contactTicketAssigned}
        </p>

        <div className="mt-6 rounded-xl border bg-muted/40 p-4 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{isBn ? "ইমেইল:" : "Email:"}</span>
            <span className="font-semibold text-foreground">{email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{isBn ? "ফোন / হোয়াটসঅ্যাপ:" : "Phone / WhatsApp:"}</span>
            <span className="font-semibold text-foreground">{phone}</span>
          </div>
          {files.length > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isBn ? "সংযুক্ত ফাইল:" : "Attachments:"}</span>
              <span className="font-semibold text-foreground">
                {files.length} {isBn ? "টি ফাইল সংযুক্ত" : files.length === 1 ? "file uploaded" : "files uploaded"}
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="mt-6 inline-flex items-center gap-2 rounded-xl border bg-background px-4 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <RotateCcw className="size-3.5" />
          <span>{t.contactSendAnother}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-9 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {t.contactFormTitle}
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
          {t.contactFormDesc}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Full Name */}
        <div>
          <label htmlFor="contact-name" className="block text-xs font-semibold text-foreground mb-1.5">
            {t.contactNameLabel} <span className="text-primary">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={isBn ? "উদা: তানভীর আহমেদ" : "e.g. Tanvir Ahmed"}
            className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>

        {/* Email & Phone Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Email Address (Must be provided) */}
          <div>
            <label htmlFor="contact-email" className="block text-xs font-semibold text-foreground mb-1.5">
              {t.contactEmailLabel} <span className="text-primary">*</span>
            </label>
            <input
              id="contact-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isBn ? "উদা: tanvir@example.com" : "tanvir@example.com"}
              className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {/* Phone / WhatsApp (Must be provided) */}
          <div>
            <label htmlFor="contact-phone" className="block text-xs font-semibold text-foreground mb-1.5">
              {t.contactPhoneLabel} <span className="text-primary">*</span>
            </label>
            <input
              id="contact-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={isBn ? "উদা: ০১৭১১-২৩৪৫৬৭" : "+880 1700-000000"}
              className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>
        </div>

        {/* Topic Selector */}
        <div>
          <label htmlFor="contact-topic" className="block text-xs font-semibold text-foreground mb-1.5">
            {t.contactTopicLabel}
          </label>
          <select
            id="contact-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
          >
            <option value="general">{t.contactGeneralInquiry}</option>
            <option value="setup">{t.contactPageSetup}</option>
            <option value="courier">{t.contactCourierSync}</option>
            <option value="billing">{t.contactBillingPlan}</option>
            <option value="technical">{t.contactBugIssue}</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="contact-message" className="block text-xs font-semibold text-foreground mb-1.5">
            {t.contactMessageLabel} <span className="text-primary">*</span>
          </label>
          <textarea
            id="contact-message"
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              isBn
                ? "আপনার কী সহায়তা প্রয়োজন বিস্তারিত জানান। প্রযোজ্য ক্ষেত্রে ফেসবুক পেজ লিংক বা কুরিয়ার পার্টনার উল্লেখ করুন..."
                : "Tell us what you need help with. Please include Facebook Page URL or courier provider if applicable..."
            }
            className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors resize-y min-h-[100px]"
          />
        </div>

        {/* Image / Video Attachment Upload */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            {t.contactAttachLabel}
          </label>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileInputChange}
            className="hidden"
            id="media-file-input"
          />

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group cursor-pointer rounded-xl border-2 border-dashed p-4.5 text-center transition-all ${
              isDragging
                ? "border-primary bg-primary/5 scale-[0.99]"
                : "border-border/80 bg-muted/20 hover:border-primary/50 hover:bg-muted/40"
            }`}
          >
            <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-card border shadow-2xs text-muted-foreground group-hover:text-primary transition-colors">
              <UploadCloud className="size-5" />
            </div>
            <p className="mt-2 text-xs font-medium text-foreground">
              {isBn
                ? "ক্লিক করে বা ড্র্যাগ অ্যান্ড ড্রপ করে ছবি / ভিডিও আপলোড করুন"
                : "Click to upload or drag and drop image / video files"}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {t.contactAttachDesc}
            </p>
          </div>

          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((file, idx) => {
                const isVideo = file.type.startsWith("video/");
                return (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center justify-between rounded-xl border bg-card p-2.5 text-xs text-foreground shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        {isVideo ? (
                          <FileVideo className="size-3.5" />
                        ) : (
                          <FileImage className="size-3.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(idx);
                      }}
                      className="grid size-6 shrink-0 place-items-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title={isBn ? "ফাইলটি মুছুন" : "Remove file"}
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !isFormValid}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>{t.contactSendingBtn}</span>
            </>
          ) : (
            <>
              <Send className="size-4" />
              <span>{t.contactSubmitBtn}</span>
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-muted-foreground">
          {isBn
            ? "🔒 অফিশিয়াল মেটা পার্টনার · ২৫৬-বিট এনক্রিপশন · আপনার গোপনীয়তা শতভাগ সুরক্ষিত"
            : "🔒 Official Meta Partner · 256-bit encrypted · We never share your data"}
        </p>
      </form>
    </div>
  );
}

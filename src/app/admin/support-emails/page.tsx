"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Mail,
  RefreshCw,
  Trash2,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Eye,
  FileImage,
  FileVideo,
  Download,
  ExternalLink,
  MessageSquare,
  User,
  Phone,
  Calendar,
  ShieldAlert,
  X,
  Send,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { AdminStat } from "@/components/admin/AdminWidgets";
import { adminApi } from "@/lib/api/admin.api";
import type {
  AdminSupportEmailDTO,
  SupportTicketStatus,
  SupportEmailAttachment,
} from "@/types/admin";

export default function AdminSupportEmailsPage() {
  const locale = useLocale();
  const isBn = locale === "bn";
  const t = useTranslations("admin");
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedTopic, setSelectedTopic] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [activeTicket, setActiveTicket] = useState<AdminSupportEmailDTO | null>(null);
  const [ticketToDelete, setTicketToDelete] = useState<AdminSupportEmailDTO | null>(null);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [showCleanupDialog, setShowCleanupDialog] = useState(false);
  const [adminNoteInput, setAdminNoteInput] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Fetch support emails
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["admin", "supportEmails", page, search, selectedStatus, selectedTopic],
    queryFn: () =>
      adminApi.supportEmails({
        page,
        limit: 20,
        search: search.trim() || undefined,
        status: selectedStatus !== "ALL" ? selectedStatus : undefined,
        topic: selectedTopic !== "ALL" ? selectedTopic : undefined,
      }),
  });

  const emails = data?.items || [];
  const counts = data?.counts || {
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    expiredThirtyDays: 0,
  };
  const pagination = data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 };

  // Status update mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, adminNote }: { id: string; status?: SupportTicketStatus; adminNote?: string | null }) =>
      adminApi.updateSupportEmail(id, { status, adminNote }),
    onSuccess: (updated) => {
      toast.success(isBn ? "টিকিট আপডেট সফল হয়েছে।" : "Support ticket updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin", "supportEmails"] });
      if (activeTicket && activeTicket.id === updated.id) {
        setActiveTicket(updated);
      }
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Failed to update ticket.");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteSupportEmail(id),
    onSuccess: (res) => {
      toast.success(
        isBn
          ? `টিকিট #${res.deletedTicket} এবং এর সাথে যুক্ত মিডিয়া মুছে ফেলা হয়েছে।`
          : `Ticket #${res.deletedTicket} and attached media deleted.`
      );
      setTicketToDelete(null);
      if (activeTicket?.id === ticketToDelete?.id) {
        setActiveTicket(null);
      }
      queryClient.invalidateQueries({ queryKey: ["admin", "supportEmails"] });
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete ticket.");
    },
  });

  // Trigger manual 30-day cleanup
  const handleTriggerCleanup = async () => {
    setIsCleaningUp(true);
    try {
      const res = await adminApi.cleanupExpiredSupportEmails();
      toast.success(
        isBn
          ? `৩০ দিনের বেশি পুরনো ${res.deletedCount} টি ইমেইল ও ${res.filesDeleted} টি মিডিয়া ফাইল মুছে ফেলা হয়েছে।`
          : `Cleaned up ${res.deletedCount} expired emails and ${res.filesDeleted} media attachments older than 30 days.`
      );
      setShowCleanupDialog(false);
      queryClient.invalidateQueries({ queryKey: ["admin", "supportEmails"] });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to cleanup expired emails.");
    } finally {
      setIsCleaningUp(false);
    }
  };

  const openTicketDetail = (ticket: AdminSupportEmailDTO) => {
    setActiveTicket(ticket);
    setAdminNoteInput(ticket.adminNote || "");
  };

  const handleSaveNote = async () => {
    if (!activeTicket) return;
    setIsUpdatingStatus(true);
    try {
      await updateStatusMutation.mutateAsync({
        id: activeTicket.id,
        adminNote: adminNoteInput.trim() || null,
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: SupportTicketStatus) => {
    await updateStatusMutation.mutateAsync({ id, status: newStatus });
  };

  const getTopicLabel = (topic: string) => {
    switch (topic) {
      case "general":
        return isBn ? "সাধারণ অনুসন্ধান" : "General Inquiry";
      case "page-setup":
        return isBn ? "ফেসবুক পেজ সেটআপ" : "Page Setup";
      case "courier":
        return isBn ? "কুরিয়ার ট্র্যাকিং/সিঙ্ক" : "Courier Sync";
      case "billing":
        return isBn ? "বিলিং ও প্ল্যান" : "Billing & Plans";
      case "bug":
        return isBn ? "সমস্যা বা বাগ রিপোর্ট" : "Bug Report";
      default:
        return topic;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 KB";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString(isBn ? "bn-BD" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getRelativeTime = (dateStr: string) => {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diffHours = Math.floor((now - then) / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return isBn ? `${diffDays} দিন আগে` : `${diffDays}d ago`;
    }
    if (diffHours > 0) {
      return isBn ? `${diffHours} ঘণ্টা আগে` : `${diffHours}h ago`;
    }
    const diffMinutes = Math.floor((now - then) / (1000 * 60));
    return isBn ? `${Math.max(1, diffMinutes)} মিনিট আগে` : `${Math.max(1, diffMinutes)}m ago`;
  };

  const isOlderThan30Days = (dateStr: string) => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return new Date(dateStr).getTime() < cutoff;
  };

  const getStatusBadge = (status: SupportTicketStatus) => {
    switch (status) {
      case "OPEN":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            {isBn ? "নতুন / ওপেন" : "Open"}
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            {isBn ? "প্রক্রিয়াধীন" : "In Progress"}
          </span>
        );
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={12} />
            {isBn ? "সমাধানকৃত" : "Resolved"}
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {isBn ? "বন্ধ" : "Closed"}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <PageHeader
        title={isBn ? "সাপোর্ট ইমেইল" : "Support Email"}
        description={
          isBn
            ? "ওয়েবসাইটের যোগাযোগ ফর্ম থেকে আসা সকল মেসেজ, টিকিট ও এটাচমেন্ট (ছবি/ভিডিও) পরিচালনা করুন। ৩০ দিন পর ডাটা স্বয়ংক্রিয়ভাবে মুছে যায়।"
            : "Review and manage all incoming contact inquiries, tickets, and media attachments. Inactive emails automatically delete after 30 days."
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 rounded-lg border bg-card px-3.5 py-2 text-sm font-medium shadow-sm hover:bg-muted transition-colors disabled:opacity-50"
            >
              <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
              {isBn ? "রিফ্রেশ" : "Refresh"}
            </button>
            <button
              type="button"
              onClick={() => setShowCleanupDialog(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors"
            >
              <Trash2 size={15} />
              {isBn ? "৩০+ দিনের ডাটা মুছুন" : "Cleanup Expired (>30d)"}
            </button>
          </div>
        }
      />

      {/* KPI Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <AdminStat
          label={isBn ? "মোট ইনকোয়ারি" : "Total Inquiries"}
          value={counts.total}
          detail={isBn ? "ওয়েবসাইট থেকে আসা মোট বার্তা" : "All received inquiries"}
        />
        <AdminStat
          label={isBn ? "ওপেন টিকিট" : "Open Tickets"}
          value={<span className="text-amber-600 dark:text-amber-400">{counts.open}</span>}
          detail={isBn ? "অপেক্ষমান বার্তা" : "Awaiting response"}
        />
        <AdminStat
          label={isBn ? "প্রক্রিয়াধীন" : "In Progress"}
          value={<span className="text-blue-600 dark:text-blue-400">{counts.inProgress}</span>}
          detail={isBn ? "বর্তমানে কাজ চলছে" : "Under review"}
        />
        <AdminStat
          label={isBn ? "সমাধানকৃত / বন্ধ" : "Resolved / Closed"}
          value={<span className="text-emerald-600 dark:text-emerald-400">{counts.resolved + counts.closed}</span>}
          detail={isBn ? "সম্পন্ন সাপোর্ট বিষয়" : "Addressed successfully"}
        />
        <AdminStat
          label={isBn ? "৩০ দিনের অটো-ডিলিট" : "30-Day Auto Cleanup"}
          value={
            <span className="flex items-center gap-1.5 text-base font-semibold text-foreground">
              <Sparkles size={16} className="text-primary" />
              {isBn ? "সক্রিয় (Active)" : "Active Cron"}
            </span>
          }
          detail={
            isBn
              ? `${counts.expiredThirtyDays} টি ইমেইল মেয়াদোত্তীর্ণ`
              : `${counts.expiredThirtyDays} tickets older than 30d`
          }
        />
      </div>

      {/* 30-Day Policy Alert */}
      <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-sm text-foreground">
        <Clock size={18} className="shrink-0 text-primary" />
        <div className="flex-1">
          <p className="font-medium">
            {isBn ? "স্বয়ংক্রিয় ৩০ দিনের ডাটা ডিলিট পলিসি" : "Automated 30-Day Data Deletion Policy"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isBn
              ? "ক্লাউডিনারি ও ডাটাবেজ থেকে সকল সাপোর্ট ইমেইল এবং আপলোডকৃত ছবি/ভিডিও ৩০ দিন পর স্বয়ংক্রিয়ভাবে মুছে ফেলা হয়। প্রতিদিন ভোর ৩:৩০ মিনিটে ব্যাকগ্রাউন্ড সিস্টেম এটি পরিচালনা করে।"
              : "All support emails and uploaded photos/videos are automatically and permanently purged after 30 days from Neon DB & Cloudinary to ensure privacy and optimize storage. Runs daily at 03:30 AM."}
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={
              isBn
                ? "টিকিট নম্বর, নাম, ইমেইল বা ফোন দিয়ে খুঁজুন..."
                : "Search ticket #, sender name, email, phone..."
            }
            className="w-full rounded-lg border bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">{isBn ? "সকল স্ট্যাটাস" : "All Status"}</option>
            <option value="OPEN">{isBn ? "ওপেন" : "Open"}</option>
            <option value="IN_PROGRESS">{isBn ? "প্রক্রিয়াধীন" : "In Progress"}</option>
            <option value="RESOLVED">{isBn ? "সমাধানকৃত" : "Resolved"}</option>
            <option value="CLOSED">{isBn ? "বন্ধ" : "Closed"}</option>
          </select>

          {/* Topic Selector */}
          <select
            value={selectedTopic}
            onChange={(e) => {
              setSelectedTopic(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="ALL">{isBn ? "সকল বিষয়" : "All Topics"}</option>
            <option value="general">{isBn ? "সাধারণ অনুসন্ধান" : "General Inquiry"}</option>
            <option value="page-setup">{isBn ? "ফেসবুক পেজ সেটআপ" : "Page Setup"}</option>
            <option value="courier">{isBn ? "কুরিয়ার সিঙ্ক" : "Courier Sync"}</option>
            <option value="billing">{isBn ? "বিলিং ও প্ল্যান" : "Billing & Plans"}</option>
            <option value="bug">{isBn ? "বাগ রিপোর্ট" : "Bug Report"}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="border-b bg-muted/60 text-xs text-muted-foreground font-medium uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">{isBn ? "টিকিট ও তারিখ" : "Ticket & Date"}</th>
                <th className="px-4 py-3">{isBn ? "গ্রাহকের তথ্য" : "Sender"}</th>
                <th className="px-4 py-3">{isBn ? "বিষয় ও বার্তা" : "Topic & Message"}</th>
                <th className="px-4 py-3">{isBn ? "সংযুক্তি" : "Attachments"}</th>
                <th className="px-4 py-3">{isBn ? "স্ট্যাটাস" : "Status"}</th>
                <th className="px-4 py-3 text-right">{isBn ? "অ্যাকশন" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <RefreshCw className="mx-auto mb-2 animate-spin text-primary" size={24} />
                    <p>{isBn ? "ডাটা লোড হচ্ছে..." : "Loading support emails..."}</p>
                  </td>
                </tr>
              ) : emails.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    <Mail className="mx-auto mb-2 opacity-40" size={32} />
                    <p className="font-medium text-foreground">
                      {isBn ? "কোনো সাপোর্ট ইমেইল পাওয়া যায়নি" : "No support inquiries found"}
                    </p>
                    <p className="text-xs mt-1">
                      {isBn
                        ? "ফিল্টার পরিবর্তন করুন অথবা নতুন বার্তার জন্য অপেক্ষা করুন।"
                        : "Try adjusting your search filters or check back later."}
                    </p>
                  </td>
                </tr>
              ) : (
                emails.map((item) => {
                  const attachmentsList = (item.attachments || []) as SupportEmailAttachment[];
                  const hasVideos = attachmentsList.some((att) => att.type === "video");
                  const hasImages = attachmentsList.some((att) => att.type === "image");
                  const isOld = isOlderThan30Days(item.createdAt);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-muted/40 transition-colors group cursor-pointer"
                      onClick={() => openTicketDetail(item)}
                    >
                      {/* Ticket # & Date */}
                      <td className="px-4 py-3.5 align-top">
                        <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-primary">
                          #{item.ticketNumber}
                          {isOld && (
                            <span
                              title={isBn ? "৩০ দিনের বেশি পুরনো (শীঘ্রই ডিলিট হবে)" : "Older than 30 days"}
                              className="inline-block h-2 w-2 rounded-full bg-red-500"
                            />
                          )}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground" title={formatDate(item.createdAt)}>
                          {getRelativeTime(item.createdAt)}
                        </div>
                      </td>

                      {/* Sender Details */}
                      <td className="px-4 py-3.5 align-top">
                        <div className="font-medium text-foreground">{item.name}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1">
                          <a
                            href={`mailto:${item.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:text-primary hover:underline"
                          >
                            {item.email}
                          </a>
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1.5">
                          <span>{item.phone}</span>
                          <a
                            href={`https://wa.me/${item.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex text-[10px] font-semibold text-emerald-600 hover:underline"
                          >
                            WhatsApp
                          </a>
                        </div>
                      </td>

                      {/* Topic & Message Preview */}
                      <td className="px-4 py-3.5 align-top max-w-xs sm:max-w-md">
                        <span className="inline-block rounded bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                          {getTopicLabel(item.topic)}
                        </span>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {item.message}
                        </p>
                        {item.adminNote && (
                          <div className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                            📝 {item.adminNote}
                          </div>
                        )}
                      </td>

                      {/* Attachments */}
                      <td className="px-4 py-3.5 align-top">
                        {attachmentsList.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
                              {hasVideos && <FileVideo size={14} className="text-blue-500" />}
                              {hasImages && <FileImage size={14} className="text-emerald-500" />}
                              {attachmentsList.length} {isBn ? "টি ফাইল" : "file(s)"}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {formatFileSize(
                                attachmentsList.reduce((acc, a) => acc + (a.size || 0), 0)
                              )}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            {isBn ? "নেই" : "None"}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 align-top" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={item.status}
                          onChange={(e) =>
                            handleStatusChange(item.id, e.target.value as SupportTicketStatus)
                          }
                          className="rounded border bg-background px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="OPEN">{isBn ? "ওপেন" : "Open"}</option>
                          <option value="IN_PROGRESS">{isBn ? "প্রক্রিয়াধীন" : "In Progress"}</option>
                          <option value="RESOLVED">{isBn ? "সমাধানকৃত" : "Resolved"}</option>
                          <option value="CLOSED">{isBn ? "বন্ধ" : "Closed"}</option>
                        </select>
                      </td>

                      {/* Action buttons */}
                      <td className="px-4 py-3.5 align-top text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title={isBn ? "বিস্তারিত দেখুন" : "View Details"}
                            onClick={() => openTicketDetail(item)}
                            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            title={isBn ? "মুছে ফেলুন" : "Delete Ticket"}
                            onClick={() => setTicketToDelete(item)}
                            className="rounded p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
            <div>
              {isBn
                ? `পৃষ্ঠা ${pagination.page} / ${pagination.totalPages} (মোট ${pagination.total} টি)`
                : `Page ${pagination.page} of ${pagination.totalPages} (${pagination.total} total)`}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded border px-3 py-1 text-xs font-medium hover:bg-muted disabled:opacity-50"
              >
                {isBn ? "পূর্ববর্তী" : "Previous"}
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded border px-3 py-1 text-xs font-medium hover:bg-muted disabled:opacity-50"
              >
                {isBn ? "পরবর্তী" : "Next"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {activeTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setActiveTicket(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border bg-card p-6 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-mono text-lg font-bold text-primary">
                    #{activeTicket.ticketNumber}
                  </h3>
                  {getStatusBadge(activeTicket.status)}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {isBn ? "জমা দেওয়ার সময়:" : "Submitted on:"} {formatDate(activeTicket.createdAt)} (
                  {getRelativeTime(activeTicket.createdAt)})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTicket(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sender Info Grid */}
            <div className="grid gap-3 sm:grid-cols-3 rounded-lg border bg-muted/40 p-4 text-xs">
              <div>
                <span className="text-muted-foreground block">{isBn ? "নাম" : "Sender Name"}</span>
                <span className="font-semibold text-foreground mt-0.5 block">{activeTicket.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">{isBn ? "ইমেইল" : "Email"}</span>
                <a
                  href={`mailto:${activeTicket.email}`}
                  className="font-medium text-primary hover:underline mt-0.5 block"
                >
                  {activeTicket.email}
                </a>
              </div>
              <div>
                <span className="text-muted-foreground block">{isBn ? "ফোন / হোয়াটসঅ্যাপ" : "Phone"}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-medium text-foreground">{activeTicket.phone}</span>
                  <a
                    href={`https://wa.me/${activeTicket.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 font-semibold hover:underline"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Topic & Message */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {isBn ? "বিষয়:" : "Topic:"}{" "}
                  <span className="text-foreground font-medium">
                    {getTopicLabel(activeTicket.topic)}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  IP: {activeTicket.ip || "unknown"}
                </span>
              </div>
              <div className="rounded-lg border bg-background p-4 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                {activeTicket.message}
              </div>
            </div>

            {/* Attachments Section */}
            {activeTicket.attachments &&
              Array.isArray(activeTicket.attachments) &&
              activeTicket.attachments.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    {isBn ? "সংযুক্ত ফাইলসমূহ (ছবি ও ভিডিও)" : "Attached Media (Photos & Videos)"}
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary text-[10px]">
                      {activeTicket.attachments.length}
                    </span>
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(activeTicket.attachments as SupportEmailAttachment[]).map((att, idx) => {
                      const isVideo = att.type === "video";
                      return (
                        <div
                          key={idx}
                          className="overflow-hidden rounded-lg border bg-muted/20 p-2.5 flex flex-col justify-between gap-2"
                        >
                          {isVideo ? (
                            <div className="aspect-video w-full overflow-hidden rounded bg-black">
                              <video
                                src={att.url}
                                controls
                                preload="metadata"
                                className="h-full w-full object-contain"
                              />
                            </div>
                          ) : (
                            <div className="relative aspect-video w-full overflow-hidden rounded bg-black/5 dark:bg-white/5">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={att.url}
                                alt={att.name || "Attachment"}
                                className="h-full w-full object-contain"
                              />
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="truncate max-w-[180px] font-medium" title={att.name}>
                              {att.name}
                            </span>
                            <span className="text-muted-foreground shrink-0">
                              {formatFileSize(att.size)}
                            </span>
                          </div>
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1 rounded border bg-card py-1 text-xs font-medium hover:bg-muted"
                          >
                            <ExternalLink size={12} />
                            {isBn ? "ফুল সাইজ দেখুন / ডাউনলোড" : "View Full / Download"}
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Admin Note Section */}
            <div className="space-y-2 border-t pt-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                {isBn ? "অভ্যন্তরীণ নোট (এডমিন অনলি)" : "Internal Staff Note (Admin Only)"}
              </label>
              <textarea
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                rows={3}
                placeholder={
                  isBn
                    ? "এই টিকিটের অগ্রগতি বা মন্তব্য লিখে রাখুন..."
                    : "Add internal staff notes or follow-up details..."
                }
                className="w-full rounded-lg border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveNote}
                  disabled={isUpdatingStatus}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  <Send size={12} />
                  {isBn ? "নোট সেভ করুন" : "Save Note"}
                </button>
              </div>
            </div>

            {/* Footer with Status Changer & Delete */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {isBn ? "স্ট্যাটাস পরিবর্তন:" : "Change Status:"}
                </span>
                <select
                  value={activeTicket.status}
                  onChange={(e) =>
                    handleStatusChange(activeTicket.id, e.target.value as SupportTicketStatus)
                  }
                  className="rounded-lg border bg-background px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="OPEN">{isBn ? "ওপেন" : "Open"}</option>
                  <option value="IN_PROGRESS">{isBn ? "প্রক্রিয়াধীন" : "In Progress"}</option>
                  <option value="RESOLVED">{isBn ? "সমাধানকৃত" : "Resolved"}</option>
                  <option value="CLOSED">{isBn ? "বন্ধ" : "Closed"}</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  setTicketToDelete(activeTicket);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600/10 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-600/20 dark:text-red-400"
              >
                <Trash2 size={13} />
                {isBn ? "টিকিট মুছুন" : "Delete Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {ticketToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setTicketToDelete(null)}
        >
          <div
            className="w-full max-w-md rounded-xl border bg-card p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-600">
              <div className="rounded-full bg-red-100 dark:bg-red-950/50 p-2.5">
                <ShieldAlert size={22} />
              </div>
              <h3 className="text-lg font-bold">
                {isBn ? "টিকিট মুছে ফেলার নিশ্চয়তা" : "Delete Support Ticket"}
              </h3>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {isBn
                ? `আপনি কি নিশ্চিত যে টিকিট #${ticketToDelete.ticketNumber} স্থায়ীভাবে মুছে ফেলতে চান? এতে ডাটাবেজ থেকে মেসেজ এবং ক্লাউডিনারি স্টোরেজ থেকে আপলোডকৃত সকল ছবি/ভিডিও এখনই চিরতরে মুছে যাবে।`
                : `Are you sure you want to permanently delete ticket #${ticketToDelete.ticketNumber}? This will immediately delete the record and wipe all attached photos/videos from Cloudinary storage.`}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setTicketToDelete(null)}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                {isBn ? "বাতিল" : "Cancel"}
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(ticketToDelete.id)}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending && <RefreshCw size={14} className="animate-spin" />}
                {isBn ? "হ্যাঁ, মুছে ফেলুন" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 30-Day Cleanup Dialog */}
      {showCleanupDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setShowCleanupDialog(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border bg-card p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-600">
              <div className="rounded-full bg-red-100 dark:bg-red-950/50 p-2.5">
                <Trash2 size={22} />
              </div>
              <h3 className="text-lg font-bold">
                {isBn ? "৩০+ দিনের মেয়াদোত্তীর্ণ ডাটা মুছুন" : "Cleanup Expired Support Inquiries"}
              </h3>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {isBn
                ? `৩০ দিনের বেশি পুরনো (${counts.expiredThirtyDays} টি) সকল সাপোর্ট ইমেইল এবং তাদের ছবি/ভিডিও স্থায়ীভাবে মুছে ফেলা হবে। আপনি কি এখনই এই ক্লিনআপ চালাতে চান?`
                : `This will permanently delete all support tickets and media attachments older than 30 days (${counts.expiredThirtyDays} expired items). Would you like to trigger this cleanup now?`}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowCleanupDialog(false)}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                {isBn ? "বাতিল" : "Cancel"}
              </button>
              <button
                type="button"
                disabled={isCleaningUp}
                onClick={handleTriggerCleanup}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isCleaningUp && <RefreshCw size={14} className="animate-spin" />}
                {isBn ? "ক্লিনআপ শুরু করুন" : "Run Cleanup Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

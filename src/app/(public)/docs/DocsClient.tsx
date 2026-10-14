"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronDown,
  Search,
  ExternalLink,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Users,
  Menu,
  X,
} from "lucide-react";
import {
  DOC_CATEGORIES,
  DOCS_CONTENT,
  type DocSubTab,
  type DocContent,
} from "./docsData";

type LangMode = "both" | "bn" | "en";

export function DocsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Find initial active subtab from URL ?tab=... or hash or default to 'what-is-bikripilot'
  const tabParam = searchParams.get("tab");

  const resolvedTabFromUrl = useMemo(() => {
    if (!tabParam) return null;
    if (tabParam === "seller-invitation") {
      return "roles-and-permissions-matrix";
    }
    if (DOCS_CONTENT[tabParam]) {
      return tabParam;
    }
    const cat = DOC_CATEGORIES.find((c) => c.id === tabParam);
    if (cat && cat.subTabs.length > 0) {
      return cat.subTabs[0].id;
    }
    return null;
  }, [tabParam]);

  const [selectedTabId, setSelectedTabId] = useState<string>("what-is-bikripilot");
  const activeTabId = resolvedTabFromUrl || selectedTabId;

  // Track expanded categories in the sidebar accordion
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    "getting-started": true,
    customization: true,
    "advanced-features": true,
    "seller-invitation": true,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMode, setLangMode] = useState<LangMode>("both");

  // Current doc content
  const activeContent: DocContent = useMemo(() => {
    return (
      DOCS_CONTENT[activeTabId] ||
      DOCS_CONTENT["what-is-bikripilot"] ||
      Object.values(DOCS_CONTENT)[0]
    );
  }, [activeTabId]);

  // Find flat list of all subtabs for Prev / Next navigation
  const flatSubTabs = useMemo(() => {
    const list: { categoryId: string; categoryTitle: string; subTab: DocSubTab }[] = [];
    for (const cat of DOC_CATEGORIES) {
      for (const st of cat.subTabs) {
        list.push({
          categoryId: cat.id,
          categoryTitle: cat.title,
          subTab: st,
        });
      }
    }
    return list;
  }, []);

  const currentIndex = flatSubTabs.findIndex((item) => item.subTab.id === activeTabId);
  const prevDoc = currentIndex > 0 ? flatSubTabs[currentIndex - 1] : null;
  const nextDoc = currentIndex < flatSubTabs.length - 1 ? flatSubTabs[currentIndex + 1] : null;

  const handleSelectTab = (tabId: string) => {
    setSelectedTabId(tabId);
    setMobileMenuOpen(false);
    // Smooth scroll to top of reading area
    window.scrollTo({ top: 0, behavior: "smooth" });
    // Update URL query quietly without page reload
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tabId);
    router.replace(url.pathname + url.search, { scroll: false });
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Filtered categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return DOC_CATEGORIES;
    const q = searchQuery.toLowerCase().trim();
    return DOC_CATEGORIES.map((cat) => {
      const matchingSubTabs = cat.subTabs.filter(
        (st) =>
          st.title.toLowerCase().includes(q) ||
          st.titleBn.toLowerCase().includes(q) ||
          st.description.toLowerCase().includes(q) ||
          st.descriptionBn.toLowerCase().includes(q) ||
          cat.title.toLowerCase().includes(q) ||
          cat.titleBn.toLowerCase().includes(q)
      );
      return {
        ...cat,
        subTabs: matchingSubTabs,
      };
    }).filter((cat) => cat.subTabs.length > 0);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* Top Docs Sub-Header / Breadcrumb & Mobile Bar */}
      <div className="border-b border-border/60 bg-muted/20 backdrop-blur-sm sticky top-16 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
          {/* Breadcrumb Path */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground overflow-x-auto py-1">
            <Link
              href="/"
              className="hover:text-foreground transition-colors shrink-0"
            >
              Home
            </Link>
            <ChevronRight className="size-3.5 shrink-0 opacity-50" />
            <span className="font-semibold text-foreground shrink-0">Docs</span>
            <ChevronRight className="size-3.5 shrink-0 opacity-50" />
            <span className="text-muted-foreground shrink-0">
              {langMode === "bn" ? activeContent.categoryTitleBn : activeContent.categoryTitle}
            </span>
            <ChevronRight className="size-3.5 shrink-0 opacity-50" />
            <span className="text-primary font-medium shrink-0 truncate max-w-[200px] sm:max-w-none">
              {langMode === "bn" ? activeContent.titleBn : activeContent.title}
            </span>
          </div>

          {/* Right Controls: Language Filter & Mobile Menu Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Language Mode Toggle (Both / বাংলা / English) */}
            <div className="inline-flex items-center rounded-lg border border-border/80 bg-background p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setLangMode("both")}
                className={`rounded-md px-2 py-1 transition-all ${
                  langMode === "both"
                    ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Bilingual / উভয় ভাষা"
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setLangMode("bn")}
                className={`rounded-md px-2 py-1 transition-all ${
                  langMode === "bn"
                    ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="শুধুমাত্র বাংলা"
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => setLangMode("en")}
                className={`rounded-md px-2 py-1 transition-all ${
                  langMode === "en"
                    ? "bg-primary text-primary-foreground font-semibold shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="English only"
              >
                EN
              </button>
            </div>

            {/* Mobile Category Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background px-3 py-1.5 text-xs font-semibold text-foreground lg:hidden shadow-2xs"
              aria-label="Toggle Documentation Navigation"
            >
              {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
              <span>{mobileMenuOpen ? "Close" : "Menu"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container: Left Sidebar + Right Content Area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14 items-start">
          {/* ========================================================= */}
          {/* LEFT SIDEBAR NAVIGATION (Pure minimal style, NO cards)     */}
          {/* ========================================================= */}
          <aside
            className={`w-full lg:w-72 shrink-0 ${
              mobileMenuOpen ? "block" : "hidden lg:block"
            } lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:pr-4 scrollbar-thin`}
          >
            {/* Search Input Box */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search docs (খুঁজুন)..."
                className="w-full rounded-lg border border-border/70 bg-background/80 pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Navigation Category Accordions */}
            <nav className="space-y-6 text-sm" aria-label="Documentation Navigation">
              {filteredCategories.map((category) => {
                const Icon = category.icon;
                const isExpanded = expandedCategories[category.id] ?? true;
                const isCurrentCategory =
                  activeContent.categoryId === category.id;

                return (
                  <div key={category.id} className="space-y-1.5">
                    {/* Category Header */}
                    <button
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className={`flex w-full items-center justify-between py-1.5 text-left font-semibold transition-colors group ${
                        isCurrentCategory
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`size-4 ${isCurrentCategory ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="text-xs uppercase tracking-wider font-bold">
                          {category.title}
                        </span>
                      </div>
                      <ChevronDown
                        className={`size-3.5 text-muted-foreground transition-transform duration-200 ${
                          isExpanded ? "rotate-0" : "-rotate-90"
                        }`}
                      />
                    </button>

                    {/* Sub-items list */}
                    {isExpanded && (
                      <ul className="space-y-0.5 border-l border-border/70 ml-2 pl-3 py-1">
                        {category.subTabs.map((subTab) => {
                          const isActive = activeTabId === subTab.id;
                          return (
                            <li key={subTab.id}>
                              <button
                                type="button"
                                onClick={() => handleSelectTab(subTab.id)}
                                className={`group flex w-full items-center justify-between py-1.5 text-left text-xs transition-colors rounded-sm ${
                                  isActive
                                    ? "font-semibold text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <span className="leading-snug">
                                  {langMode === "bn"
                                    ? subTab.titleBn
                                    : subTab.title}
                                </span>
                                {subTab.badge && (
                                  <span
                                    className={`ml-1.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium leading-none ${
                                      subTab.badge === "Read First" || subTab.badge === "Important"
                                        ? "bg-primary/10 text-primary"
                                        : "bg-muted text-muted-foreground"
                                    }`}
                                  >
                                    {subTab.badge}
                                  </span>
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Seller Dashboard Quick Jump */}
            <div className="mt-8 pt-6 border-t border-border/60">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Quick Actions
                </p>
                <Link
                  href="/dashboard/team"
                  className="flex items-center justify-between text-xs font-semibold text-primary hover:underline group py-1"
                >
                  <span className="flex items-center gap-1.5">
                    <Users className="size-3.5" />
                    <span>Manage Team Members</span>
                  </span>
                  <ExternalLink className="size-3 text-muted-foreground group-hover:text-primary" />
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center justify-between text-xs font-semibold text-muted-foreground hover:text-foreground group py-1"
                >
                  <span>Need Custom Help? Contact Desk</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          </aside>

          {/* ========================================================= */}
          {/* RIGHT READING CONTENT (Pure editorial style, NO cards)    */}
          {/* ========================================================= */}
          <main className="min-w-0 flex-1 max-w-4xl pb-16">
            {/* Category Tag & Header */}
            <div className="space-y-3 pb-8 border-b border-border/60">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                <BookOpen className="size-3.5" />
                <span>
                  {langMode === "bn"
                    ? activeContent.categoryTitleBn
                    : activeContent.categoryTitle}
                </span>
              </div>

              {/* Title with bilingual support */}
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
                {langMode === "bn" ? activeContent.titleBn : activeContent.title}
              </h1>

              {/* Secondary Language Title if in 'both' mode */}
              {langMode === "both" && (
                <p className="text-lg font-medium text-muted-foreground/90">
                  {activeContent.titleBn}
                </p>
              )}

              {/* Lead Paragraph */}
              <div className="space-y-2 pt-2">
                {(langMode === "both" || langMode === "en") && (
                  <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                    {activeContent.lead}
                  </p>
                )}
                {(langMode === "both" || langMode === "bn") && (
                  <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                    {activeContent.leadBn}
                  </p>
                )}
              </div>

              {/* Special Action Banner for Seller Invitation */}
              {activeContent.categoryId === "seller-invitation" && (
                <div className="mt-4 flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href="/dashboard/team"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90"
                  >
                    <Users className="size-3.5" />
                    <span>Go to Team Management (/dashboard/team)</span>
                    <ArrowRight className="size-3" />
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    টিম মেম্বার আমন্ত্রণ পাঠাতে সরাসরি আপনার ড্যাশবোর্ডের টিম পেজে যান।
                  </span>
                </div>
              )}
            </div>

            {/* Content Sections */}
            <div className="mt-10 space-y-12">
              {activeContent.sections.map((section, sIdx) => (
                <article key={sIdx} className="space-y-6">
                  {/* Section Heading */}
                  {(section.heading || section.headingBn) && (
                    <div className="space-y-1">
                      {(langMode === "both" || langMode === "en") && section.heading && (
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                          {section.heading}
                        </h2>
                      )}
                      {(langMode === "both" || langMode === "bn") && section.headingBn && (
                        <p
                          className={`${
                            langMode === "both"
                              ? "text-base font-semibold text-muted-foreground"
                              : "text-xl sm:text-2xl font-bold tracking-tight text-foreground"
                          }`}
                        >
                          {section.headingBn}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Section Paragraphs */}
                  {section.paragraphs && (
                    <div className="space-y-3">
                      {(langMode === "both" || langMode === "en") &&
                        section.paragraphs.map((para, pIdx) => (
                          <p
                            key={`en-${pIdx}`}
                            className="text-sm sm:text-base leading-7 text-muted-foreground"
                          >
                            {para}
                          </p>
                        ))}
                      {(langMode === "both" || langMode === "bn") &&
                        section.paragraphsBn?.map((paraBn, pbIdx) => (
                          <p
                            key={`bn-${pbIdx}`}
                            className="text-sm sm:text-base leading-7 text-muted-foreground"
                          >
                            {paraBn}
                          </p>
                        ))}
                    </div>
                  )}

                  {/* Bullet Lists */}
                  {section.bullets && (
                    <div className="space-y-4 pt-2">
                      {section.bullets.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-3">
                          <CheckCircle2 className="size-4 shrink-0 text-primary mt-1" />
                          <div className="space-y-1 text-sm leading-6">
                            {(bullet.title || bullet.titleBn) && (
                              <p className="font-semibold text-foreground">
                                {langMode === "bn"
                                  ? bullet.titleBn || bullet.title
                                  : bullet.title}
                                {langMode === "both" && bullet.titleBn && (
                                  <span className="ml-1 text-muted-foreground font-normal">
                                    ({bullet.titleBn})
                                  </span>
                                )}
                              </p>
                            )}
                            {(langMode === "both" || langMode === "en") && (
                              <p className="text-muted-foreground">{bullet.text}</p>
                            )}
                            {(langMode === "both" || langMode === "bn") && (
                              <p className="text-muted-foreground">{bullet.textBn}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Step-by-Step Flow */}
                  {section.steps && (
                    <div className="space-y-5 pt-2">
                      {section.steps.map((step, stepIdx) => (
                        <div
                          key={stepIdx}
                          className="flex items-start gap-4 pb-5 border-b border-border/40 last:border-0"
                        >
                          <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
                            {step.number}
                          </div>
                          <div className="space-y-1.5 flex-1">
                            <p className="text-sm font-semibold text-foreground">
                              {langMode === "bn" ? step.titleBn : step.title}
                              {langMode === "both" && (
                                <span className="ml-2 font-normal text-muted-foreground text-xs">
                                  · {step.titleBn}
                                </span>
                              )}
                            </p>
                            {(langMode === "both" || langMode === "en") && (
                              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                {step.text}
                              </p>
                            )}
                            {(langMode === "both" || langMode === "bn") && (
                              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                {step.textBn}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Informational Callout (Soft background, NO card outline) */}
                  {section.callout && (
                    <div
                      className={`rounded-lg p-4 text-xs sm:text-sm leading-relaxed ${
                        section.callout.type === "warning"
                          ? "bg-amber-500/10 text-amber-900 dark:text-amber-200 border-l-2 border-amber-500"
                          : "bg-primary-soft text-foreground border-l-2 border-primary"
                      }`}
                    >
                      <p className="font-semibold mb-1">
                        {langMode === "bn"
                          ? section.callout.titleBn
                          : section.callout.title}
                        {langMode === "both" && (
                          <span className="ml-1 opacity-75 font-normal">
                            ({section.callout.titleBn})
                          </span>
                        )}
                      </p>
                      {(langMode === "both" || langMode === "en") && (
                        <p>{section.callout.text}</p>
                      )}
                      {(langMode === "both" || langMode === "bn") && (
                        <p className="mt-1">{section.callout.textBn}</p>
                      )}
                    </div>
                  )}

                  {/* ⭐️ ROLES & PERMISSIONS TABLE (Clean, borderless, easy-to-read) */}
                  {section.table && (
                    <div className="space-y-4 pt-2">
                      <div className="overflow-x-auto rounded-xl border border-border/80 bg-background/50">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-border/80 bg-muted/40">
                              {section.table.headers.map((h, hIdx) => (
                                <th
                                  key={hIdx}
                                  className="px-4 py-3 font-semibold text-foreground uppercase tracking-wider text-[11px]"
                                >
                                  {langMode === "bn" ? h.bn : h.en}
                                  {langMode === "both" && (
                                    <span className="block text-[10px] font-normal text-muted-foreground capitalize">
                                      {h.bn}
                                    </span>
                                  )}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60">
                            {section.table.rows.map((row, rIdx) => (
                              <tr
                                key={rIdx}
                                className="transition-colors hover:bg-muted/30"
                              >
                                {/* Role column */}
                                <td className="px-4 py-4 align-top font-semibold text-foreground whitespace-nowrap">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-foreground">
                                        {row.role}
                                      </span>
                                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                        {row.badge}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground font-normal">
                                      {row.roleBn}
                                    </p>
                                  </div>
                                </td>

                                {/* Purpose column */}
                                <td className="px-4 py-4 align-top text-muted-foreground min-w-[180px] max-w-[240px]">
                                  {(langMode === "both" || langMode === "en") && (
                                    <p className="text-[11.5px] leading-relaxed">
                                      {row.purpose}
                                    </p>
                                  )}
                                  {(langMode === "both" || langMode === "bn") && (
                                    <p className="text-[11.5px] leading-relaxed mt-1 text-foreground/80">
                                      {row.purposeBn}
                                    </p>
                                  )}
                                </td>

                                {/* Granted Permissions */}
                                <td className="px-4 py-4 align-top min-w-[240px]">
                                  <ul className="space-y-1.5">
                                    {(langMode === "both" || langMode === "en") &&
                                      row.permissions.map((p, pIdx) => (
                                        <li
                                          key={`p-en-${pIdx}`}
                                          className="flex items-start gap-1.5 text-[11.5px] text-foreground/90"
                                        >
                                          <span className="text-emerald-500 font-bold shrink-0">
                                            ✓
                                          </span>
                                          <span>{p}</span>
                                        </li>
                                      ))}
                                    {(langMode === "both" || langMode === "bn") &&
                                      row.permissionsBn.map((pBn, pIdx) => (
                                        <li
                                          key={`p-bn-${pIdx}`}
                                          className={`flex items-start gap-1.5 text-[11.5px] text-muted-foreground ${
                                            langMode === "both" ? "opacity-85" : "text-foreground/90"
                                          }`}
                                        >
                                          <span className="text-emerald-500 font-bold shrink-0">
                                            ✓
                                          </span>
                                          <span>{pBn}</span>
                                        </li>
                                      ))}
                                  </ul>
                                </td>

                                {/* Restrictions */}
                                <td className="px-4 py-4 align-top min-w-[200px]">
                                  <ul className="space-y-1.5">
                                    {(langMode === "both" || langMode === "en") &&
                                      row.restrictions.map((r, rIdx) => (
                                        <li
                                          key={`r-en-${rIdx}`}
                                          className="flex items-start gap-1.5 text-[11.5px] text-rose-600 dark:text-rose-400"
                                        >
                                          <span className="font-bold shrink-0">✕</span>
                                          <span>{r}</span>
                                        </li>
                                      ))}
                                    {(langMode === "both" || langMode === "bn") &&
                                      row.restrictionsBn.map((rBn, rIdx) => (
                                        <li
                                          key={`r-bn-${rIdx}`}
                                          className={`flex items-start gap-1.5 text-[11.5px] text-rose-600/80 dark:text-rose-400/80 ${
                                            langMode === "both" ? "opacity-85" : ""
                                          }`}
                                        >
                                          <span className="font-bold shrink-0">✕</span>
                                          <span>{rBn}</span>
                                        </li>
                                      ))}
                                  </ul>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>

            {/* Bottom Next/Previous Topic Navigation (Dyno style) */}
            <div className="mt-16 pt-8 border-t border-border/60">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                {/* Previous Doc */}
                {prevDoc ? (
                  <button
                    type="button"
                    onClick={() => handleSelectTab(prevDoc.subTab.id)}
                    className="flex flex-col items-start p-3 text-left rounded-lg transition-colors hover:bg-muted/40 group max-w-sm"
                  >
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
                      <span>Previous</span>
                    </span>
                    <span className="mt-1 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {langMode === "bn"
                        ? prevDoc.subTab.titleBn
                        : prevDoc.subTab.title}
                    </span>
                  </button>
                ) : (
                  <div />
                )}

                {/* Next Doc */}
                {nextDoc ? (
                  <button
                    type="button"
                    onClick={() => handleSelectTab(nextDoc.subTab.id)}
                    className="flex flex-col items-end p-3 text-right rounded-lg transition-colors hover:bg-muted/40 group max-w-sm ml-auto"
                  >
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      <span>Next</span>
                      <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                    <span className="mt-1 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {langMode === "bn"
                        ? nextDoc.subTab.titleBn
                        : nextDoc.subTab.title}
                    </span>
                  </button>
                ) : (
                  <div />
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

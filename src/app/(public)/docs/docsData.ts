import {
  BookOpen,
  Layers,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface DocSubTab {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  badge?: string;
}

export interface DocCategory {
  id: string;
  title: string;
  titleBn: string;
  icon: LucideIcon;
  subTabs: DocSubTab[];
}

export interface DocContent {
  id: string;
  categoryId: string;
  categoryTitle: string;
  categoryTitleBn: string;
  title: string;
  titleBn: string;
  lead: string;
  leadBn: string;
  sections: {
    heading?: string;
    headingBn?: string;
    subheading?: string;
    subheadingBn?: string;
    paragraphs?: string[];
    paragraphsBn?: string[];
    bullets?: {
      title?: string;
      titleBn?: string;
      text: string;
      textBn: string;
    }[];
    callout?: {
      type: "tip" | "info" | "warning";
      title: string;
      titleBn: string;
      text: string;
      textBn: string;
    };
    steps?: {
      number: string;
      title: string;
      titleBn: string;
      text: string;
      textBn: string;
    }[];
    table?: {
      headers: { en: string; bn: string }[];
      rows: {
        role: string;
        roleBn: string;
        purpose: string;
        purposeBn: string;
        permissions: string[];
        permissionsBn: string[];
        restrictions: string[];
        restrictionsBn: string[];
        badge: string;
      }[];
    };
  }[];
}

export const DOC_CATEGORIES: DocCategory[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    titleBn: "শুরুর নির্দেশিকা",
    icon: BookOpen,
    subTabs: [
      {
        id: "what-is-bikripilot",
        title: "What is BikriPilot?",
        titleBn: "বিক্রিপাইলট কি?",
        description: "Overview of the social commerce operating system",
        descriptionBn: "সোশ্যাল কমার্স প্ল্যাটফর্মের প্রাথমিক পরিচিতি",
      },
      {
        id: "how-it-works",
        title: "How It Works",
        titleBn: "কীভাবে কাজ করে?",
        description: "From Meta handshake to courier cash reconciliation",
        descriptionBn: "পেজ কানেক্ট থেকে ক্যাশ রিকনসিলিয়েশন পর্যন্ত সম্পূর্ণ প্রক্রিয়া",
      },
      {
        id: "quick-start",
        title: "Quick Start Guide",
        titleBn: "কুইক স্টার্ট ৩-ধাপে সেটআপ",
        description: "Launch your automated store in under 5 minutes",
        descriptionBn: "৫ মিনিটেরও কম সময়ে আপনার স্টোর লাইভ করুন",
        badge: "Essential",
      },
      {
        id: "security-compliance",
        title: "Security & Meta OAuth",
        titleBn: "নিরাপত্তা ও মেটা ওঅথ",
        description: "Official Graph API handshake and AES-256 data security",
        descriptionBn: "অফিসিয়াল মেটা পার্টনার সিকিউরিটি ও ডেটা এনক্রিপশন",
      },
    ],
  },
  {
    id: "customization",
    title: "Customization",
    titleBn: "কাস্টমাইজেশন ও স্টোর সেটআপ",
    icon: Layers,
    subTabs: [
      {
        id: "channel-setup",
        title: "Connecting Social Channels",
        titleBn: "সোশ্যাল চ্যানেল কানেকশন",
        description: "Official Meta Facebook & Instagram integration",
        descriptionBn: "ফেসবুক ও ইনস্টাগ্রাম অফিশিয়াল পেজ লিংক করার নিয়ম",
      },
      {
        id: "ai-assistant",
        title: "AI Assistant & Knowledge",
        titleBn: "AI অ্যাসিস্ট্যান্ট টিউনিং",
        description: "Train the AI in Bangla, Banglish, and shop policies",
        descriptionBn: "বাংলা, বাংলিশ ও কাস্টম প্রোডাক্ট নলেজ দিয়ে AI ট্রেন করা",
      },
      {
        id: "courier-setup",
        title: "Connecting Courier Partners",
        titleBn: "কুরিয়ার পার্টনার সেটআপ",
        description: "Steadfast, Pathao, RedX, and Paperfly API integration",
        descriptionBn: "স্টেডফাস্ট, পাঠাও ও রেডএক্স কুরিয়ার API কনফিগারেশন",
      },
      {
        id: "automation-rules",
        title: "Comment & Reply Automation",
        titleBn: "কমেন্ট ও মেসেজ অটোমেশন",
        description: "Set up instant post comment replies & inbox routing",
        descriptionBn: "অটো কমেন্ট রিপ্লাই ও ইনস্ট্যান্ট ইনবক্স মেসেজিং নিয়মাবলী",
      },
    ],
  },
  {
    id: "advanced-features",
    title: "Advanced Features",
    titleBn: "অ্যাডভান্সড ফিচার ও টুলস",
    icon: Zap,
    subTabs: [
      {
        id: "omnichannel-inbox",
        title: "Omnichannel Social Inbox",
        titleBn: "ইউনিফায়েড সোশ্যাল ইনবক্স",
        description: "Single screen for Messenger, comments, and order creation",
        descriptionBn: "এক স্ক্রিনে সব পেজের চ্যাট ও ইন-চ্যাট সরাসরি অর্ডার বুকিং",
      },
      {
        id: "ai-order-extraction",
        title: "AI Order Extraction",
        titleBn: "AI এক-ক্লিকে অর্ডার এক্সট্রাকশন",
        description: "Instant address & phone parsing from conversations",
        descriptionBn: "চ্যাট কনভারসেশন থেকে সরাসরি গ্রাহকের ঠিকানা ও অর্ডার পার্সিং",
        badge: "Smart",
      },
      {
        id: "fraud-risk-checker",
        title: "Delivery Fraud & Risk Checker",
        titleBn: "ডেলিভারি ফ্রড ডিটেকশন",
        description: "Predict parcel return risk before dispatching orders",
        descriptionBn: "অর্ডার পাঠানোর আগেই রিটার্ন রিস্ক ও ফেক বায়ার অ্যালার্ট",
      },
      {
        id: "hisab-khata",
        title: "Hisab Khata & COD Reconciliation",
        titleBn: "হিসাব খাতা ও COD রিকনসিলিয়েশন",
        description: "Automated cash matching against courier payout statements",
        descriptionBn: "কুরিয়ার পেমেন্ট শিট ও ব্যাংকিং ক্যাশফ্লোর নির্ভুল মেলবন্ধন",
      },
      {
        id: "analytics-reporting",
        title: "Analytics & Performance",
        titleBn: "সেলস ও পারফরম্যান্স অ্যানালিটিক্স",
        description: "Real-time revenue metrics, agent response times, and trends",
        descriptionBn: "লাইভ বিক্রয় হিসাব, টিম মেম্বারদের রেসপন্স টাইম ও ডেলিভারি রেট",
      },
    ],
  },
  {
    id: "seller-invitation",
    title: "Seller Invitation & Team Roles",
    titleBn: "সেলার ইনভাইটেশন ও টিম মেম্বার রোলস",
    icon: Users,
    subTabs: [
      {
        id: "seller-invitation-overview",
        title: "Overview & Team Collaboration",
        titleBn: "টিম কোলাবোরেশন ও ইনভাইটেশন পরিচিতি",
        description: "Delegate tasks without compromising shop ownership or privacy",
        descriptionBn: "নিরাপদে শপের দায়িত্ব টিম মেম্বারদের মাঝে ভাগ করে দেওয়ার নিয়ম",
        badge: "Important",
      },
      {
        id: "how-to-invite-teammates",
        title: "How to Invite Team Members",
        titleBn: "কীভাবে টিম মেম্বারদের আমন্ত্রণ জানাবেন",
        description: "Step-by-step walkthrough to add teammates to your shop",
        descriptionBn: "ড্যাশবোর্ড থেকে নতুন সদস্যকে আমন্ত্রণ জানানোর সহজ উপায়",
      },
      {
        id: "roles-and-permissions-matrix",
        title: "Roles & Permissions Breakdown",
        titleBn: "সম্পূর্ণ রোল ও পারমিশন ম্যাট্রিক্স টেবিল",
        description: "Detailed breakdown of Owner, Manager, Agent, Fulfilment & Accountant",
        descriptionBn: "প্রতিটি পদের সুনির্দিষ্ট ক্ষমতা, অনুমতি এবং সীমাবদ্ধতার তুলনামূলক ছক",
        badge: "Read First",
      },
      {
        id: "role-selection-guide",
        title: "Role Recommendations & Use Cases",
        titleBn: "সঠিক পদ নির্ধারণের পরামর্শ",
        description: "Which role to assign to chat agents, packers, and accountants",
        descriptionBn: "কাস্টমার সাপোর্ট, প্যাকিং টিম ও হিসাবরক্ষকের জন্য উপযুক্ত রোল নির্বাচন",
      },
      {
        id: "team-security-2fa",
        title: "Team Security & 2FA Enforcement",
        titleBn: "টিম সিকিউরিটি ও ২-ফ্যাক্টর অথেনটিকেশন",
        description: "Securing team access, activity audits, and instant offboarding",
        descriptionBn: "টু-ফ্যাক্টর সিকিউরিটি, অ্যাকশন লগ ও মেম্বার রিমুভ করার নিয়ম",
      },
    ],
  },
];

export const DOCS_CONTENT: Record<string, DocContent> = {
  "what-is-bikripilot": {
    id: "what-is-bikripilot",
    categoryId: "getting-started",
    categoryTitle: "Getting Started",
    categoryTitleBn: "শুরুর নির্দেশিকা",
    title: "What is BikriPilot?",
    titleBn: "বিক্রিপাইলট কি ও কেন ব্যবহার করবেন?",
    lead: "BikriPilot is an intelligent social commerce operating system built specifically for modern online merchants in Bangladesh and South Asia.",
    leadBn: "বিক্রিপাইলট হলো আধুনিক সোশ্যাল কমার্স উদ্যোক্তাদের জন্য তৈরি একটি সমন্বিত অপারেটিং সিস্টেম, যা ফেসবুক, ইনস্টাগ্রাম, কুরিয়ার ও আর্থিক ব্যবস্থাপনাকে এক ছাদের নিচে নিয়ে আসে।",
    sections: [
      {
        heading: "The Challenge of Social Selling",
        headingBn: "সোশ্যাল বিজনেসের বিদ্যমান চ্যালেঞ্জ",
        paragraphs: [
          "Social media merchants spend hours jumping between Facebook Messenger, Instagram DMs, courier portals (like Steadfast or Pathao), and offline spreadsheets or paper ledgers. This fragmented process leads to missed customer inquiries, duplicate order entries, delivery return losses, and untracked courier cash.",
        ],
        paragraphsBn: [
          "অনলাইন পেজ পরিচালনাকারীদের প্রতিদিন ফেসবুক মেসেঞ্জার, ইনস্টাগ্রাম চ্যাট, একাধিক কুরিয়ার পোর্টাল (যেমন পাঠাও বা স্টেডফাস্ট) এবং খাতা-কলম বা এক্সেল শিটের মাঝে ছোটাছুটি করতে হয়। এর ফলে কাস্টমারদের রিপ্লাই দিতে বিলম্ব হয়, ভুয়া অর্ডারে কুরিয়ার লস বাড়ে এবং কুরিয়ার থেকে পাঠানো টাকার হিসাব মেলানো জটিল হয়ে পড়ে।",
        ],
      },
      {
        heading: "How BikriPilot Solves This",
        headingBn: "বিক্রিপাইলটের সমাধান",
        paragraphs: [
          "BikriPilot unifies your entire business lifecycle into a single, high-speed dashboard. From official Meta Graph API messaging to AI-assisted customer order extraction, instant courier consignment generation, and automated cash reconciliation, everything is handled synchronously.",
        ],
        paragraphsBn: [
          "বিক্রিপাইলট আপনার সম্পূর্ণ ব্যবসা পরিচালনার প্রক্রিয়াকে একটি সুনির্দিষ্ট প্ল্যাটফর্মে নিয়ে আসে। মেটার অফিশিয়াল এপিআই দিয়ে মেসেজিং, কাস্টমার চ্যাট থেকে স্বয়ংক্রিয় অর্ডার তৈরি, এক ক্লিকে পার্সেল বুকিং এবং কুরিয়ারের সিওডি টাকার নির্ভুল হিসাব খাতা — সবই স্বয়ংক্রিয়ভাবে সম্পন্ন হয়।",
        ],
        bullets: [
          {
            title: "Unified Omni-Channel Inbox",
            titleBn: "একীভূত সোশ্যাল ইনবক্স",
            text: "Aggregate customer chats, comments, and inquiries across all your connected social pages with zero delay.",
            textBn: "আপনার সব পেজের মেসেজ ও কমেন্ট এক জায়গায় বসে হ্যান্ডেল করুন কোনো মিস ছাড়াই।",
          },
          {
            title: "AI-Powered Conversational Agent",
            titleBn: "বুদ্ধিমান এআই অ্যাসিস্ট্যান্ট",
            text: "Native comprehension of conversational Bengali, English, and Banglish to assist agents with accurate, instant responses.",
            textBn: "বাংলা, ইংরেজি এবং বাংলিশ বুঝে দ্রুত সঠিক রিপ্লাই ও অর্ডার তৈরির ক্ষমতা।",
          },
          {
            title: "One-Click Courier Logistics",
            titleBn: "এক ক্লিকে কুরিয়ার পার্সেল বুকিং",
            text: "Instantly create consignments with Steadfast, Pathao, RedX, and generate printable shipping slips.",
            textBn: "ম্যানুয়ালি এন্ট্রি না দিয়ে এক ক্লিকে কুরিয়ার পোর্টালে পার্সেল পাঠানো ও চালান প্রিন্ট করা।",
          },
          {
            title: "Automated Hisab & COD Reconciliation",
            titleBn: "স্বয়ংক্রিয় হিসাব খাতা ও পেমেন্ট ট্র্যাকিং",
            text: "Eliminate manual bookkeeping. Courier COD settlements are matched directly with actual delivered parcels.",
            textBn: "কুরিয়ার কোম্পানি কত টাকা জমা দিল আর কত বকেয়া আছে তা সেকেন্ডেই স্পষ্ট হিসেব।",
          },
        ],
      },
    ],
  },

  "how-it-works": {
    id: "how-it-works",
    categoryId: "getting-started",
    categoryTitle: "Getting Started",
    categoryTitleBn: "শুরুর নির্দেশিকা",
    title: "How It Works",
    titleBn: "প্ল্যাটফর্মটি কীভাবে কাজ করে?",
    lead: "Explore the end-to-end journey from receiving a customer message to automated delivery tracking and financial settlement.",
    leadBn: "কাস্টমারের প্রথম মেসেজ থেকে শুরু করে পার্সেল ডেলিভারি ও আর্থিক রিকনসিলিয়েশন পর্যন্ত প্রতিটি ধাপ কীভাবে কাজ করে তা জেনে নিন।",
    sections: [
      {
        heading: "4-Phase Workflow Architecture",
        headingBn: "৪টি মূল ধাপে সম্পূর্ণ প্রক্রিয়া",
        steps: [
          {
            number: "01",
            title: "Official Meta Graph Authorization",
            titleBn: "মেটা ওঅথ দিয়ে সুরক্ষিত পেজ কানেক্ট",
            text: "Connect your official Facebook page via secure OAuth handshake. No passwords are ever shared or stored on our servers. All auth tokens are encrypted using AES-256-GCM.",
            textBn: "কোনো পাসওয়ার্ড শেয়ার না করে অফিশিয়াল ফেসবুক অথেনটিকেশনের মাধ্যমে নিরাপদ কানেকশন স্থাপন। সম্পূর্ণ ডেটা ব্যাংকিং গ্রেড এনক্রিপশনে সুরক্ষিত থাকে।",
          },
          {
            number: "02",
            title: "Catalog & Courier Configuration",
            titleBn: "প্রোডাক্ট ক্যাটালগ ও কুরিয়ার এপিআই সেটআপ",
            text: "Add your store items, SKU variants, and inventory. Enter your preferred courier API keys (Steadfast, Pathao, RedX) to unlock direct shipping access.",
            textBn: "আপনার পণ্য তালিকা ও স্টক যোগ করুন এবং কুরিয়ার এপিআই কি দিয়ে সংযোগ সম্পন্ন করুন।",
          },
          {
            number: "03",
            title: "AI Chat Assistance & Risk Check",
            titleBn: "এআই অ্যাসিস্ট্যান্টের সাহায্য ও ফ্রড চেক",
            text: "When a customer writes in Messenger or Instagram, AI provides instant smart suggestions. With one tap, parse the buyer's phone and address, and verify their historical delivery completion rate.",
            textBn: "গ্রাহকের মেসেজ পাওয়ার সাথে সাথে এআই সঠিক পণ্যের তথ্য দেয়। এক ক্লিকে ঠিকানা বের করে ভুয়া বা রিটার্নপ্রবণ ক্রেতা কিনা তা যাচাই করা যায়।",
          },
          {
            number: "04",
            title: "Dispatch & Automatic Cash Reconciliation",
            titleBn: "পার্সেল বুকিং ও স্বয়ংক্রিয় টাকা মেলানো",
            text: "Dispatch orders directly to your courier. Once delivered, courier payout files or API settlements automatically reconcile with your digital Hisab Khata ledger.",
            textBn: "সরাসরি কুরিয়ারে পাঠিয়ে গ্রাহককে লাইভ ট্র্যাকিং লিংক প্রদান এবং কুরিয়ার পেমেন্ট আসার পর স্বয়ংক্রিয়ভাবে হিসাব খাতায় ব্যালেন্স আপডেট।",
          },
        ],
      },
      {
        callout: {
          type: "tip",
          title: "Speed Advantage",
          titleBn: "কাজের গতি বহুগুণ বৃদ্ধি",
          text: "Merchants using BikriPilot report reducing order processing time from 7 minutes down to 35 seconds per customer.",
          textBn: "বিক্রিপাইলট ব্যবহারকারী মার্চেন্টদের প্রতিটি অর্ডার প্রক্রিয়া করার সময় গড়ে ৭ মিনিট থেকে মাত্র ৩৫ সেকেন্ডে নেমে আসে।",
        },
      },
    ],
  },

  "quick-start": {
    id: "quick-start",
    categoryId: "getting-started",
    categoryTitle: "Getting Started",
    categoryTitleBn: "শুরুর নির্দেশিকা",
    title: "Quick Start Guide (3-Step Setup)",
    titleBn: "কুইক স্টার্ট ৩-ধাপে সেটআপ গাইড",
    lead: "Get your shop fully configured and ready to process live customer orders in less than 5 minutes.",
    leadBn: "মাত্র ৫ মিনিটের মধ্যে আপনার শপ সম্পূর্ণ রেডি করে লাইভ কাস্টমার অর্ডার প্রসেস শুরু করুন।",
    sections: [
      {
        heading: "Step 1: Create Account & Complete Profile",
        headingBn: "ধাপ ১: একাউন্ট তৈরি ও প্রোফাইল সেটআপ",
        paragraphs: [
          "Sign up with your business email. Set your store currency (BDT) and official phone number. For maximum security, enable Two-Factor Authentication (2FA) immediately from your profile settings.",
        ],
        paragraphsBn: [
          "আপনার বিজনেস ইমেইল দিয়ে রেজিস্ট্রেশন সম্পন্ন করুন। শপের নাম ও মোবাইল নম্বর নির্ধারণ করুন এবং শপের নিরাপত্তার স্বার্থে শুরুতেই প্রোফাইল থেকে ২-ফ্যাক্টর অথেনটিকেশন (2FA) চালু করে নিন।",
        ],
      },
      {
        heading: "Step 2: Connect Your Facebook Page",
        headingBn: "ধাপ ২: ফেসবুক পেজ কানেক্ট করুন",
        paragraphs: [
          "Navigate to Dashboard > Settings > Channels. Click 'Connect Facebook Page'. Log in to Meta, select the pages you manage, and grant the required messaging and webhooks permissions.",
        ],
        paragraphsBn: [
          "ড্যাশবোর্ডের Settings > Channels মেনুতে গিয়ে 'Connect Facebook Page' বাটনে ক্লিক করুন। মেটার পপআপে আপনার পেজ নির্বাচন করে পারমিশন অনুমতি দিন।",
        ],
      },
      {
        heading: "Step 3: Connect Courier Partner",
        headingBn: "ধাপ ৩: কুরিয়ার পার্টনার যুক্ত করুন",
        paragraphs: [
          "Go to Dashboard > Couriers or Settings > Delivery. Select Steadfast, Pathao, or RedX. Paste your API Key and Secret from your courier merchant portal and click Save.",
        ],
        paragraphsBn: [
          "Dashboard > Couriers সেকশনে গিয়ে আপনার ব্যবহৃত কুরিয়ার নির্বাচন করুন। কুরিয়ার পোর্টাল থেকে প্রাপ্ত API Key পেস্ট করে সেভ করুন। ব্যস, আপনার স্টোর সম্পূর্ণ প্রস্তুত!",
        ],
      },
    ],
  },

  "security-compliance": {
    id: "security-compliance",
    categoryId: "getting-started",
    categoryTitle: "Getting Started",
    categoryTitleBn: "শুরুর নির্দেশিকা",
    title: "Security & Meta OAuth Compliance",
    titleBn: "প্ল্যাটফর্ম নিরাপত্তা ও মেটা ওঅথ কমপ্লায়েন্স",
    lead: "Understand our industry-standard security architecture, encryption measures, and data handling policies.",
    leadBn: "আমাদের আন্তর্জাতিক মানের সিকিউরিটি আর্কিটেকচার, এনক্রিপশন ও গ্রাহক ডেটা সুরক্ষার নিয়মাবলী সম্পর্কে জানুন।",
    sections: [
      {
        heading: "Zero Password Sharing",
        headingBn: "কোনো পাসওয়ার্ড শেয়ার করার প্রয়োজন নেই",
        paragraphs: [
          "We strictly adhere to official Meta Graph API protocols. You never give us your personal Facebook or Instagram credentials. Everything uses OAuth 2.0 scoped access tokens.",
        ],
        paragraphsBn: [
          "আমরা শতভাগ মেটার অফিশিয়াল নিয়ম মেনে চলি। কোনো কর্মী বা আমাদের সিস্টেম কখনই আপনার ফেসবুকের মূল পাসওয়ার্ড চাইবে না। মেটার নিরাপদ ওঅথ টোকেনের মাধ্যমেই সম্পূর্ণ কার্যক্রম চলে।",
        ],
      },
      {
        heading: "AES-256-GCM Token Encryption",
        headingBn: "AES-256-GCM টোকেন এনক্রিপশন",
        paragraphs: [
          "All API keys, courier secret keys, and page access tokens are encrypted at rest using military-grade AES-256-GCM authenticated encryption. Encryption keys are securely stored in segregated environment vaults.",
        ],
        paragraphsBn: [
          "আপনার কুরিয়ার এপিআই কি ও মেটা টোকেনগুলো ডাটাবেসে মিলিটারি-গ্রেড AES-256-GCM এনক্রিপশনের মাধ্যমে সংরক্ষিত থাকে। ফলে কেউ অননুমোদিতভাবে তা দেখতে পারে না।",
        ],
      },
    ],
  },

  "channel-setup": {
    id: "channel-setup",
    categoryId: "customization",
    categoryTitle: "Customization",
    categoryTitleBn: "কাস্টমাইজেশন ও স্টোর সেটআপ",
    title: "Connecting Social Channels",
    titleBn: "সোশ্যাল চ্যানেল কানেকশন ও ফেসবুক পেজ সেটআপ",
    lead: "Seamlessly integrate your business Facebook Pages and Instagram professional accounts.",
    leadBn: "আপনার ফেসবুক বিজনেস পেজ ও ইনস্টাগ্রাম প্রফেশনাল একাউন্ট সহজে যুক্ত করুন।",
    sections: [
      {
        heading: "Step-by-Step Connection",
        headingBn: "ধাপে ধাপে পেজ যুক্ত করার নিয়ম",
        paragraphs: [
          "Connecting your official pages enables real-time message sync, comment notifications, and instant order creation straight from customer chats.",
        ],
        paragraphsBn: [
          "আপনার পেজ কানেক্ট করলে কাস্টমারের নতুন ইনবক্স মেসেজ ও পোস্টের কমেন্টগুলো সাথে সাথে আপনার ড্যাশবোর্ডে চলে আসবে এবং সেখান থেকেই সরাসরি অর্ডার নেওয়া যাবে।",
        ],
        steps: [
          {
            number: "01",
            title: "Access Channels Settings",
            titleBn: "চ্যানেল সেটিংসে প্রবেশ করুন",
            text: "In your seller dashboard, navigate to Settings > Channels.",
            textBn: "ড্যাশবোর্ডের বাম পাশের মেনু থেকে Settings > Channels সেকশনে যান।",
          },
          {
            number: "02",
            title: "Meta Authorization",
            titleBn: "মেটা অথোরাইজেশন সম্পন্ন করুন",
            text: "Click 'Connect Facebook Page'. Confirm your Facebook profile in the Meta popup dialogue.",
            textBn: "'Connect Facebook Page' বাটনে ক্লিক করে আপনার পেজ ম্যানেজ করার অনুমতি দিন।",
          },
          {
            number: "03",
            title: "Select Active Pages",
            titleBn: "শপের জন্য পেজ সিলেক্ট করুন",
            text: "Choose the specific Facebook Page you wish to manage under this shop, then click Confirm.",
            textBn: "যে পেজটির মেসেজ ও অর্ডার এই শপে দেখতে চান তা নির্বাচন করে কনফার্ম করুন।",
          },
        ],
      },
    ],
  },

  "ai-assistant": {
    id: "ai-assistant",
    categoryId: "customization",
    categoryTitle: "Customization",
    categoryTitleBn: "কাস্টমাইজেশন ও স্টোর সেটআপ",
    title: "AI Assistant & Knowledge Base",
    titleBn: "AI অ্যাসিস্ট্যান্ট ও শপ নলেজ কনফিগারেশন",
    lead: "Train your AI assistant with your specific products, policies, return rules, and pricing structure.",
    leadBn: "আপনার শপের নির্দিষ্ট পণ্য, ডেলিভারি চার্জ, রিটার্ন পলিসি ও নিয়মাবলী শিখিয়ে এআইকে নিজের মতো তৈরি করুন।",
    sections: [
      {
        heading: "Bilingual Knowledge Engine",
        headingBn: "দ্বিভাষিক নলেজ ইঞ্জিন (বাংলা ও বাংলিশ)",
        paragraphs: [
          "BikriPilot's AI assistant is natively calibrated for Bangladeshi conversational patterns. It understands prompts written in standard Bengali (বাংলা), phonetic Banglish (e.g., 'vai ei product er delivery charge koto?'), and English.",
        ],
        paragraphsBn: [
          "আমাদের এআই দেশীয় কাস্টমারদের স্বাভাবিক চ্যাটিং প্যাটার্নের সাথে সম্পূর্ণ অভ্যস্ত। কাস্টমার বিশুদ্ধ বাংলায় লিখুক কিংবা বাংলিশে (যেমন: 'bhai delivery charge koto?'), এআই সঠিক উত্তর বুঝে সঠিক তথ্য উপস্থাপন করতে পারে।",
        ],
      },
      {
        heading: "Custom Knowledge Documents",
        headingBn: "শপের নিজস্ব নিয়ম ও তথ্য যোগ করা",
        paragraphs: [
          "Under Dashboard > AI > Knowledge, upload or type your business information: delivery timeline (Dhaka inside 24-48h, outside 72h), refund rules, and size guides. The AI references this verified data before suggesting responses.",
        ],
        paragraphsBn: [
          "Dashboard > AI > Knowledge সেকশনে গিয়ে আপনার শপের ডেলিভারি সময় (ঢাকায় ২৪-৪৮ ঘণ্টা, ঢাকার বাইরে ৩ দিন), রিটার্ন পলিসি ও সাইজ চার্ট লিখে দিন। এআই সর্বদা এই নিয়মের ভিত্তিতেই উত্তর সাজাবে।",
        ],
      },
    ],
  },

  "courier-setup": {
    id: "courier-setup",
    categoryId: "customization",
    categoryTitle: "Customization",
    categoryTitleBn: "কাস্টমাইজেশন ও স্টোর সেটআপ",
    title: "Connecting Courier Partners",
    titleBn: "কুরিয়ার পার্টনার ও ডেলিভারি সেটআপ",
    lead: "Direct API integration with Steadfast, Pathao, RedX, and Paperfly for one-tap shipping generation.",
    leadBn: "স্টেডফাস্ট, পাঠাও, রেডএক্স ও পেপারফ্লাইয়ের সাথে সরাসরি এপিআই সংযোগ করে এক ক্লিকে পার্সেল বুকিং।",
    sections: [
      {
        heading: "Supported Courier Networks",
        headingBn: "সাপোর্টেড কুরিয়ার নেটওয়ার্ক",
        bullets: [
          {
            title: "Steadfast Courier",
            titleBn: "স্টেডফাস্ট কুরিয়ার",
            text: "Full API support for parcel creation, live tracking webhooks, and automatic COD return status syncing.",
            textBn: "পার্সেল এন্ট্রি, লাইভ ট্র্যাকিং আপডেট এবং সিওডি পেমেন্ট স্ট্যাটাস স্বয়ংক্রিয় সিঙ্ক।",
          },
          {
            title: "Pathao Courier",
            titleBn: "পাঠাও কুরিয়ার",
            text: "Fast city dispatch, automated tracking URL delivery to customers, and store pickup requests.",
            textBn: "দ্রুততম সিটি ডেলিভারি, কাস্টমারদের ট্র্যাকিং এসএমএস/লিংক পাঠানো এবং পিকআপ রিকোয়েস্ট।",
          },
          {
            title: "RedX & Paperfly",
            titleBn: "রেডএক্স ও পেপারফ্লাই",
            text: "Nationwide doorstep delivery network with real-time consignment status monitoring.",
            textBn: "সারাদেশে ডোরস্টেপ ডেলিভারি এবং রিয়েলটাইম পার্সেল ট্র্যাকিং সুবিধা।",
          },
        ],
      },
    ],
  },

  "automation-rules": {
    id: "automation-rules",
    categoryId: "customization",
    categoryTitle: "Customization",
    categoryTitleBn: "কাস্টমাইজেশন ও স্টোর সেটআপ",
    title: "Comment & Reply Automation",
    titleBn: "অটো কমেন্ট রিপ্লাই ও ইনবক্স অটোমেশন",
    lead: "Never keep potential buyers waiting. Automate public post replies and seamlessly redirect prospects into private Messenger conversations.",
    leadBn: "সম্ভাব্য ক্রেতাদের অপেক্ষায় রাখবেন না। পোস্টের কমেন্টে স্বয়ংক্রিয় রিপ্লাই দিন এবং ক্রেতাকে সরাসরি ইনবক্সে নিয়ে আসুন।",
    sections: [
      {
        heading: "Smart Keyword Matching",
        headingBn: "স্মার্ট কি-ওয়ার্ড ও কন্ডিশনাল রিপ্লাই",
        paragraphs: [
          "Define trigger rules for frequent phrases like 'price?', 'koto?', 'details please', or 'available?'. BikriPilot can automatically reply to the public Facebook comment and simultaneously send a private message containing the product catalog and price details.",
        ],
        paragraphsBn: [
          "ফেসবুক পোস্টে 'দাম কত?', 'price', 'detalis' ইত্যাদি কি-ওয়ার্ডের জন্য স্বয়ংক্রিয় রিপ্লাই সেট করুন। কমেন্টে ধন্যবাদ জানিয়ে একই সাথে গ্রাহকের ইনবক্সে পণ্যের সাইজ, ছবি ও অর্ডার লিংক পাঠিয়ে দেওয়া যাবে।",
        ],
      },
    ],
  },

  "omnichannel-inbox": {
    id: "omnichannel-inbox",
    categoryId: "advanced-features",
    categoryTitle: "Advanced Features",
    categoryTitleBn: "অ্যাডভান্সড ফিচার ও টুলস",
    title: "Omnichannel Social Inbox",
    titleBn: "ইউনিফায়েড সোশ্যাল ইনবক্স",
    lead: "A powerhouse workspace combining Messenger conversations, comments, inventory lookups, and order creation in one single window.",
    leadBn: "একটি দ্রুতগতির ওয়ার্কস্পেস যেখানে মেসেঞ্জার চ্যাট, পোস্টের কমেন্ট, পণ্য স্টক ও সরাসরি অর্ডার বুকিং এক স্ক্রিনেই সম্ভব।",
    sections: [
      {
        heading: "In-Conversation Order Creation",
        headingBn: "চ্যাটিং চলাকালীন সরাসরি অর্ডার বুকিং",
        paragraphs: [
          "Agents never need to switch tabs or open separate order sheets. When chatting with a customer, the right-side panel displays current product inventory. Simply click the product, confirm the delivery address, and the order is instantly created and assigned a unique tracking number.",
        ],
        paragraphsBn: [
          "গ্রাহকের সাথে কথা বলার সময় ডান পাশের প্যানেলে থাকা প্রডাক্ট সিলেক্ট করে এক ক্লিকেই অর্ডার কনফার্ম করা যায়। অন্য কোনো উইন্ডো বা সফটওয়্যার খোলার কোনো প্রয়োজন হয় না।",
        ],
      },
    ],
  },

  "ai-order-extraction": {
    id: "ai-order-extraction",
    categoryId: "advanced-features",
    categoryTitle: "Advanced Features",
    categoryTitleBn: "অ্যাডভান্সড ফিচার ও টুলস",
    title: "AI Order Extraction",
    titleBn: "AI এক-ক্লিকে অর্ডার এক্সট্রাকশন",
    lead: "Harness AI to instantly parse messy customer messages into structured recipient names, 11-digit Bangladeshi mobile numbers, and complete street addresses.",
    leadBn: "কাস্টমারের এলোমেলো মেসেজ থেকে এক ক্লিকে নাম, ১১ ডিজিটের মোবাইল নম্বর, জেলা ও বিস্তারিত ঠিকানা আলাদা করে ফেলা।",
    sections: [
      {
        heading: "Zero Manual Typing Errors",
        headingBn: "ভুল বানানের নির্ভুল সমাধান",
        paragraphs: [
          "Customers often type addresses haphazardly (e.g. 'mirpur 10, road 4, house 12, phone 017xxxxxxxx ami 2 ta nibo black color'). Our extraction engine detects the exact quantity, color variation, mobile number, and delivery district with over 99% accuracy.",
        ],
        paragraphsBn: [
          "গ্রাহকরা প্রায়শই একটি মেসেজে সব তথ্য একসাথে লিখে দেন। আমাদের এআই সেই মেসেজটি স্ক্যান করে নিজে থেকেই পণ্যের কালার, সাইজ, মোবাইল নম্বর ও থানা/জেলা আলাদা বক্সে বসিয়ে দেয়।",
        ],
      },
    ],
  },

  "fraud-risk-checker": {
    id: "fraud-risk-checker",
    categoryId: "advanced-features",
    categoryTitle: "Advanced Features",
    categoryTitleBn: "অ্যাডভান্সড ফিচার ও টুলস",
    title: "Delivery Fraud & Risk Checker",
    titleBn: "ডেলিভারি ফ্রড ডিটেকশন ও রিক্স চেকার",
    lead: "Protect your cash flow by identifying high-risk phone numbers and fake buyers before spending delivery courier fees.",
    leadBn: "অর্ডার পাঠানোর আগেই ভুয়া কাস্টমার ও রিটার্নপ্রবণ ক্রেতা শনাক্ত করে অপ্রয়োজনীয় কুরিয়ার চার্জ ও পণ্য আটকে থাকার ক্ষতি রোধ করুন।",
    sections: [
      {
        heading: "How Risk Scoring Works",
        headingBn: "রিস্ক স্কোরিং কীভাবে কাজ করে?",
        paragraphs: [
          "Every time an order is placed, the recipient's phone number is evaluated against historical delivery success benchmarks. The algorithm analyzes past delivery success rates, total return ratios across merchant networks, and reported fraudulent parcel history.",
        ],
        paragraphsBn: [
          "অর্ডার বুক করার সাথে সাথে কাস্টমারের ফোন নম্বরের পূর্ববর্তী ডেলিভারির ইতিহাস বিশ্লেষণ করা হয়। তিনি অতীতে কতগুলো পার্সেল রিসিভ করেছেন এবং কতগুলো ক্যানসেল বা রিটার্ন করেছেন তা স্পষ্টভাবে দেখা যায়।",
        ],
        bullets: [
          {
            title: "Green Badge (Low Risk)",
            titleBn: "সবুজ ব্যাজ (নিরাপদ ক্রেতা)",
            text: "Over 85% verified delivery success history across couriers. Safe to dispatch without hesitation.",
            textBn: "ডেলিভারি সাকসেস রেট ৮৫% এর বেশি। নিশ্চিন্তে পার্সেল বুক করা যাবে।",
          },
          {
            title: "Yellow Badge (Medium Risk)",
            titleBn: "হলুদ ব্যাজ (সতর্কতা)",
            text: "New number or 50-70% delivery success rate. Recommended to make a quick phone confirmation.",
            textBn: "নতুন নম্বর অথবা সফলতার হার ৫০-৭০%। ফোনে কল দিয়ে অর্ডারটি কনফার্ম করা উচিত।",
          },
          {
            title: "Red Alert (High Risk / Fraud)",
            titleBn: "লাল অ্যালার্ট (উচ্চ ঝুঁকি)",
            text: "Heavy return history or multiple merchant fraud reports. We recommend requiring an advance delivery charge before dispatch.",
            textBn: "অত্যধিক পার্সেল রিটার্নের রেকর্ড। কুরিয়ার চার্জ অগ্রিম নিয়ে তবেই পার্সেল পাঠানো বুদ্ধিমানের কাজ।",
          },
        ],
      },
    ],
  },

  "hisab-khata": {
    id: "hisab-khata",
    categoryId: "advanced-features",
    categoryTitle: "Advanced Features",
    categoryTitleBn: "অ্যাডভান্সড ফিচার ও টুলস",
    title: "Hisab Khata & Automatic COD Reconciliation",
    titleBn: "হিসাব খাতা ও কুরিয়ার পেমেন্ট রিকনসিলিয়েশন",
    lead: "Eliminate manual bookkeeping spreadsheets. Automatically match courier bank transfers against your actual dispatched orders.",
    leadBn: "ম্যানুয়াল খাতা-কলম বা এক্সেল শিটের দিন শেষ। কুরিয়ারের ব্যাংক ট্রান্সফারের সাথে প্রতিটি অর্ডারের টাকা স্বয়ংক্রিয়ভাবে মিলিয়ে নিন।",
    sections: [
      {
        heading: "Automated COD Statement Reconciliation",
        headingBn: "স্বয়ংক্রিয় সিওডি পেমেন্ট মেলানো",
        paragraphs: [
          "When courier companies (like Steadfast or Pathao) disburse weekly or daily COD payouts, they provide a settlement invoice or spreadsheet. With BikriPilot, upload or sync your settlement file: the system instantly flags discrepancies, missing parcels, uncredited deliveries, or unauthorized deductions.",
        ],
        paragraphsBn: [
          "কুরিয়ার কোম্পানিগুলো যখন টাকা পাঠায়, তখন অনেক সময় বোঝা কঠিন হয় কোন পার্সেলের কত টাকা আসল। বিক্রিপাইলট স্বয়ংক্রিয়ভাবে কুরিয়ারের পেমেন্ট রিপোর্ট স্ক্যান করে প্রতিটি অর্ডারের টাকার সাথে পাই-টু-পাই মিলিয়ে দেয়।",
        ],
      },
    ],
  },

  "analytics-reporting": {
    id: "analytics-reporting",
    categoryId: "advanced-features",
    categoryTitle: "Advanced Features",
    categoryTitleBn: "অ্যাডভান্সড ফিচার ও টুলস",
    title: "Analytics & Performance Reporting",
    titleBn: "সেলস ও পারফরম্যান্স অ্যানালিটিক্স",
    lead: "Actionable real-time insights into your shop's revenue, gross margins, courier delivery success, and teammate productivity.",
    leadBn: "আপনার শপের দৈনিক বিক্রি, লাভ-ক্ষতির মার্জিন, কুরিয়ার ডেলিভারি সাকসেস এবং টিম মেম্বারদের কার্যদক্ষতার লাইভ রিপোর্ট।",
    sections: [
      {
        heading: "Key Performance Indicators",
        headingBn: "মূল ব্যবসায়িক সূচকসমূহ",
        bullets: [
          {
            title: "Revenue & Gross Margin",
            titleBn: "মোট বিক্রি ও লাভ",
            text: "Net profit tracking factoring in product cost of goods (COG) and delivery deductions.",
            textBn: "পণ্যের মূল খরচ ও কুরিয়ার চার্জ বাদে আসল নেট প্রফিটের রিয়েলটাইম চিত্র।",
          },
          {
            title: "Courier Delivery Rate",
            titleBn: "ডেলিভারি সাকসেস বনাম রিটার্ন হার",
            text: "Compare performance between Steadfast, Pathao, and RedX across different districts.",
            textBn: "কোন কুরিয়ারে আপনার পার্সেল বেশি সফলভাবে পৌঁছাচ্ছে তা তুলনামূলকভাবে দেখুন।",
          },
          {
            title: "Teammate Performance",
            titleBn: "টিম মেম্বারদের কাজের মূল্যায়ন",
            text: "Track individual agent response time, volume of closed conversations, and generated sales.",
            textBn: "কোন এজেন্ট কত দ্রুত রিপ্লাই দিচ্ছেন এবং কত টাকার সেল আনছেন তার স্বচ্ছ পরিসংখ্যান।",
          },
        ],
      },
    ],
  },

  // ⭐️ CRITICAL SECTION: SELLER INVITATION & TEAM ROLES
  "seller-invitation-overview": {
    id: "seller-invitation-overview",
    categoryId: "seller-invitation",
    categoryTitle: "Seller Invitation & Team Roles",
    categoryTitleBn: "সেলার ইনভাইটেশন ও টিম মেম্বার রোলস",
    title: "Overview & Team Collaboration",
    titleBn: "টিম কোলাবোরেশন ও ইনভাইটেশন পরিচিতি",
    lead: "Scale your e-commerce operations safely. Invite trusted staff to handle customer messaging, packaging, logistics, and bookkeeping without giving away control of your business.",
    leadBn: "নিরাপদে আপনার অনলাইন ব্যবসা বড় করুন। শপের মূল পাসওয়ার্ড বা আর্থিক নিয়ন্ত্রণ না হারিয়েই চ্যাট সাপোর্ট, প্যাকিং, ডেলিভারি ও হিসাব ব্যবস্থাপনার দায়িত্ব বিশ্বস্ত টিম মেম্বারদের মাঝে ভাগ করে দিন।",
    sections: [
      {
        heading: "Why You Should Never Share Master Passwords",
        headingBn: "কখনোই মাস্টার পাসওয়ার্ড বা ওনার একাউন্ট শেয়ার করবেন না",
        paragraphs: [
          "A major mistake online sellers make is sharing the owner's personal Facebook password, email login, or courier credentials with shop helpers. If a dispute arises or an employee departs, they could delete pages, alter bank details, or export customer contacts. BikriPilot's Role-Based Access Control (RBAC) solves this entirely: each teammate logs in with their own personal account, and they only see what their role permits.",
        ],
        paragraphsBn: [
          "অনেক অনলাইন মার্চেন্ট কাজের সুবিধার জন্য নিজের ব্যক্তিগত ফেসবুক আইডি বা মাস্টার পাসওয়ার্ড কর্মচারীদের দিয়ে থাকেন। এটি অত্যন্ত ঝুঁকিপূর্ণ; কর্মী চলে গেলে পেজের ক্ষতি বা গ্রাহকের তথ্য চুরির আশঙ্কা থাকে। বিক্রিপাইলটের রোল-বেজড সিস্টেমের মাধ্যমে প্রতিটি কর্মী তাদের নিজস্ব ইমেইল দিয়ে লগইন করবেন এবং আপনি তাদের যে কাজের অনুমতি দেবেন শুধু সেটুকুই দেখতে পাবেন।",
        ],
      },
      {
        heading: "Core Benefits of Team Invitation",
        headingBn: "টিম মেম্বার যুক্ত করার প্রধান সুবিধাসমূহ",
        bullets: [
          {
            title: "Complete Role Separation",
            titleBn: "সুনির্দিষ্ট দায়িত্ব বণ্টন",
            text: "Customer support agents cannot see your profit margins or billing. Warehouse packers cannot read private Messenger chats. Accountants cannot tamper with customer products.",
            textBn: "চ্যাট এজেন্টরা আপনার লাভ বা বিলিং দেখতে পাবেন না; প্যাকিং টিম কাস্টমারের ইনবক্স চ্যাট পড়তে পারবে না; আর হিসাবরক্ষক প্রডাক্টের পরিবর্তন করতে পারবেন না।",
          },
          {
            title: "Granular Activity Auditing",
            titleBn: "প্রতিটি কাজের হিসাব ও স্বচ্ছতা",
            text: "Every order created, discount applied, status changed, or courier booked is permanently attributed to the specific teammate who performed it.",
            textBn: "কে কোন অর্ডার কনফার্ম করলেন বা কোন পার্সেলটি ডিসপ্যাচ করলেন তা নামের সাথে রেকর্ড থাকে। ফলে কোনো বিভ্রান্তি সৃষ্টি হয় না।",
          },
          {
            title: "Instant One-Click Offboarding",
            titleBn: "এক ক্লিকে এক্সেস বন্ধ করার সুবিধা",
            text: "If a staff member resigns, revoke their invitation with a single click. Their access to your store is cut off immediately with zero risk.",
            textBn: "কোনো কর্মী চাকরি ছেড়ে দিলে মুহূর্তের মধ্যে একটি ক্লিকেই তার এক্সেস বাতিল করে দেওয়া যায়।",
          },
        ],
      },
      {
        callout: {
          type: "tip",
          title: "Direct Dashboard Link",
          titleBn: "টিম মেম্বার পেজের লিংক",
          text: "Ready to invite your first teammate? Go to Dashboard > Settings > Team (/dashboard/team) to send an invitation now.",
          textBn: "আপনার প্রথম টিম মেম্বারকে যুক্ত করতে ড্যাশবোর্ডের Settings > Team (/dashboard/team) পেজে যান।",
        },
      },
    ],
  },

  "how-to-invite-teammates": {
    id: "how-to-invite-teammates",
    categoryId: "seller-invitation",
    categoryTitle: "Seller Invitation & Team Roles",
    categoryTitleBn: "সেলার ইনভাইটেশন ও টিম মেম্বার রোলস",
    title: "How to Invite Team Members (Step-by-Step)",
    titleBn: "কীভাবে টিম মেম্বারদের আমন্ত্রণ পাঠাবেন (ধাপে ধাপে গাইড)",
    lead: "Follow this exact walkthrough to invite new team members to your store and get them up to speed.",
    leadBn: "আপনার শপে নতুন সদস্য যোগ করতে নিচের সহজ ধাপগুলো অনুসরণ করুন।",
    sections: [
      {
        heading: "Step-by-Step Invitation Process",
        headingBn: "আমন্ত্রণ পাঠানোর বিস্তারিত ধাপসমূহ",
        steps: [
          {
            number: "01",
            title: "Enable 2FA on Your Account",
            titleBn: "প্রোফাইলে ২-ফ্যাক্টর অথেনটিকেশন (2FA) চালু করুন",
            text: "To protect shop integrity, the platform requires Owners to have Two-Factor Authentication (2FA) active on their profile before issuing team invites. If not yet active, visit Profile Settings to enable it via Google Authenticator or SMS.",
            textBn: "শপের সর্বোচ্চ নিরাপত্তার জন্য টিম মেম্বার আমন্ত্রণ জানানোর পূর্বে শপ ওনারের একাউন্টে ২-ফ্যাক্টর সিকিউরিটি (2FA) চালু থাকা বাধ্যতামূলক।",
          },
          {
            number: "02",
            title: "Open Team Management Screen",
            titleBn: "টিম ম্যানেজমেন্ট স্ক্রিনে যান",
            text: "From your main seller dashboard, click Settings on the left navigation, then select 'Team' (or go directly to /dashboard/team).",
            textBn: "ড্যাশবোর্ডের বাম পাশের সেটিংস মেনু থেকে 'Team' অপশনটিতে ক্লিক করুন (অথবা সরাসরি /dashboard/team লিংকে যান)।",
          },
          {
            number: "03",
            title: "Click 'Invite Member'",
            titleBn: "'Invite Member' বাটনে ক্লিক করুন",
            text: "Click the primary 'Invite Member' button located at the top right of the Team Members page.",
            textBn: "টিম পেজের উপরের ডান পাশে থাকা 'Invite Member' বাটনে ক্লিক করুন। একটি আমন্ত্রণ ফরম ওপেন হবে।",
          },
          {
            number: "04",
            title: "Enter Teammate's Email & Choose Role",
            titleBn: "সদস্যের ইমেইল লিখুন এবং সঠিক পদ নির্বাচন করুন",
            text: "Enter the email address of the person you wish to invite. Select their appropriate role from the dropdown (Manager, Agent, Fulfilment, Accountant, or Viewer). Please refer to the Roles Matrix before choosing.",
            textBn: "আপনার কর্মীর ইমেইল অ্যাড্রেস লিখুন এবং ড্রপডাউন থেকে তার কাজের জন্য সঠিক রোলটি (Manager, Agent, Fulfilment, Accountant, অথবা Viewer) বেছে নিন।",
          },
          {
            number: "05",
            title: "Send Invitation & Confirmation",
            titleBn: "আমন্ত্রণ পাঠান ও কনফার্মেশন",
            text: "Click 'Send Invitation'. The invited member will immediately receive an email with a secure link to accept and join your shop. If they don't have an account yet, they can sign up with that email and automatically gain access.",
            textBn: "'Send Invitation' বাটনে ক্লিক করুন। কর্মীর ইমেইলে একটি সিকিউর ইনভাইটেশন লিংক চলে যাবে। তিনি লিংকটিতে ক্লিক করলেই আপনার শপের সাথে যুক্ত হয়ে যাবেন।",
          },
        ],
      },
      {
        callout: {
          type: "warning",
          title: "Important Rule for Owners & Managers",
          titleBn: "ওনার ও ম্যানেজারদের জন্য বিশেষ নিয়ম",
          text: "Only the shop OWNER can assign the MANAGER role. A Manager can invite Agents, Fulfilment, Accountants, and Viewers, but cannot create other Managers.",
          textBn: "শুধুমাত্র শপের আসল মালিক (OWNER) অন্য কাউকে MANAGER রোল দিতে পারেন। একজন ম্যানেজার অন্যান্য কর্মী যুক্ত করতে পারলেও নতুন কোনো ম্যানেজার বানাতে পারেন না।",
        },
      },
    ],
  },

  "roles-and-permissions-matrix": {
    id: "roles-and-permissions-matrix",
    categoryId: "seller-invitation",
    categoryTitle: "Seller Invitation & Team Roles",
    categoryTitleBn: "সেলার ইনভাইটেশন ও টিম মেম্বার রোলস",
    title: "Comprehensive Roles & Permissions Matrix",
    titleBn: "টিম মেম্বার রোল ও পারমিশন বিস্তারিত ছক",
    lead: "Review this exact breakdown of what each role can and cannot do within BikriPilot before assigning roles to your staff.",
    leadBn: "আপনার কর্মচারীদের আমন্ত্রণ জানানোর আগে প্রতিটি পদের সুনির্দিষ্ট ক্ষমতা, অনুমতি এবং সীমাবদ্ধতা নিচের ছক থেকে বিস্তারিত জেনে নিন।",
    sections: [
      {
        heading: "Official Role Access Comparison",
        headingBn: "সকল পদের তুলনামূলক ক্ষমতার তালিকা",
        paragraphs: [
          "BikriPilot enforces a zero-trust permission architecture. Every action is authenticated against the role constants defined in the system. Here is the complete breakdown:",
        ],
        paragraphsBn: [
          "প্ল্যাটফর্মটিতে প্রতিটি পদের ক্ষমতা কোড লেভেলে কঠোরভাবে নিয়ন্ত্রিত। নিচের টেবিলে প্রতিটি রোলের কাজের পরিধি সুন্দরভাবে তুলে ধরা হলো:",
        ],
        table: {
          headers: [
            { en: "Role / Title", bn: "পদবী ও ভূমিকা" },
            { en: "Primary Purpose", bn: "কাজের মূল উদ্দেশ্য" },
            { en: "Granted Access & Powers", bn: "অনুমোদিত ক্ষমতা (কী কী করতে পারবেন)" },
            { en: "Restricted Actions", bn: "সীমাবদ্ধতা (যা করতে পারবেন না)" },
          ],
          rows: [
            {
              role: "OWNER",
              roleBn: "মালিক (Shop Owner)",
              badge: "Full Access",
              purpose: "Ultimate authority and legal owner of the business shop.",
              purposeBn: "শপের মূল স্বত্বাধিকারী এবং সর্বোচ্চ প্রশাসনিক নিয়ন্ত্রক।",
              permissions: [
                "All platform permissions enabled",
                "Manage billing, plan upgrades & subscriptions",
                "Assign all roles including MANAGER",
                "Connect or remove Facebook pages & courier accounts",
                "Delete store or transfer ownership",
              ],
              permissionsBn: [
                "সিস্টেমের সমস্ত ফিচার ও সেটিংসে সম্পূর্ণ নিয়ন্ত্রণ",
                "বিলিং, সাবস্ক্রিপশন প্ল্যান আপগ্রেড ও পেমেন্ট পরিচালনা",
                "ম্যানেজারসহ যেকোনো টিম মেম্বার যুক্ত বা বাদ দেওয়া",
                "ফেসবুক পেজ ও কুরিয়ার এপিআই কানেক্ট বা ডিসকানেক্ট করা",
                "শপ ডিলিট বা ট্রান্সফার করার একক ক্ষমতা",
              ],
              restrictions: ["None. Owner holds absolute authority."],
              restrictionsBn: ["কোনো সীমাবদ্ধতা নেই। সম্পূর্ণ শপের পূর্ণ নিয়ন্ত্রণ ওনারের হাতে।"],
            },
            {
              role: "MANAGER",
              roleBn: "ম্যানেজার (Operations Lead)",
              badge: "Admin Ops",
              purpose: "Day-to-day operations leader supervising team, orders, catalog, and customers.",
              purposeBn: "দৈনন্দিন শপ অপারেশন, অর্ডার, ক্যাটালগ ও টিম তদারকির দায়িত্বপ্রাপ্ত প্রধান।",
              permissions: [
                "Manage products, stock & inventory",
                "View and manage customer orders & shipments",
                "Reply to chats, comments & supervise agents",
                "Invite & remove staff (Agent, Fulfilment, Accountant, Viewer)",
                "Configure AI prompts and automation rules",
                "View sales analytics and reports",
              ],
              permissionsBn: [
                "প্রোডাক্ট ক্যাটালগ, স্টক ও ইনভেন্টরি এডিট করা",
                "সমস্ত অর্ডার প্রসেস করা ও কুরিয়ারে পাঠানো",
                "কাস্টমার চ্যাট ও কমেন্ট তদারকি ও রিপ্লাই দেওয়া",
                "টিম মেম্বার আমন্ত্রণ ও পরিচালনা করা (এজেন্ট, প্যাকার, হিসাবরক্ষক)",
                "এআই সেটিংস ও অটোমেশন রুলস টিউন করা",
                "সেলস রিপোর্ট ও অ্যানালিটিক্স দেখা",
              ],
              restrictions: [
                "Cannot modify subscription billing or plan payments",
                "Cannot assign the MANAGER role to others",
                "Cannot delete the shop or remove the Owner",
              ],
              restrictionsBn: [
                "বিলিং বা পেমেন্ট মেথড পরিবর্তন করতে পারবেন না",
                "অন্য কাউকে MANAGER বানাতে পারবেন না",
                "শপ ডিলিট করতে বা আসল মালিককে রিমুভ করতে পারবেন না",
              ],
            },
            {
              role: "AGENT",
              roleBn: "এজেন্ট (Customer Support & Sales)",
              badge: "Sales / Support",
              purpose: "Customer engagement, answering inquiries, handling comments, and booking orders.",
              purposeBn: "কাস্টমারদের মেসেজ ও কমেন্টের উত্তর দেওয়া এবং দ্রুত অর্ডার কনফার্ম করা।",
              permissions: [
                "Read & reply to customer Messenger & Instagram chats",
                "Read & reply to public post comments",
                "Use AI assistant to generate responses",
                "Create and update customer orders from chat",
                "View product prices and stock availability",
                "Perform delivery risk checks on buyer phone numbers",
              ],
              permissionsBn: [
                "মেসেঞ্জার ও ইনস্টাগ্রাম চ্যাটে কাস্টমারদের উত্তর দেওয়া",
                "ফেসবুক পোস্টের কমেন্টে রিপ্লাই দেওয়া",
                "এআই অ্যাসিস্ট্যান্ট ব্যবহার করে দ্রুত তথ্য বের করা",
                "চ্যাট থেকেই সরাসরি কাস্টমারের অর্ডার তৈরি করা",
                "প্রোডাক্টের স্টক ও দাম চেক করা",
                "কাস্টমারের ফোন নম্বরে ডেলিভারি রিস্ক ও ফ্রড হিস্টোরি চেক করা",
              ],
              restrictions: [
                "No access to Hisab Khata or courier COD money reconciliation",
                "No access to shop settings, billing, or subscription plans",
                "Cannot delete products or change product prices",
                "Cannot invite or manage other team members",
              ],
              restrictionsBn: [
                "হিসাব খাতা বা কুরিয়ার থেকে পাওয়া টাকার হিসাবে কোনো অ্যাক্সেস নেই",
                "শপ সেটিংস, বিলিং বা চ্যানেল কানেকশনে প্রবেশাধিকার নেই",
                "প্রোডাক্ট ডিলিট করতে বা পণ্যের মূল দাম পরিবর্তন করতে পারবেন না",
                "অন্য কোনো কর্মী যোগ করতে বা বাদ দিতে পারবেন না",
              ],
            },
            {
              role: "FULFILMENT",
              roleBn: "ফুলফিলমেন্ট (Warehouse & Packaging)",
              badge: "Warehouse",
              purpose: "Packaging items, printing shipping slips, dispatching consignments to couriers.",
              purposeBn: "অর্ডার প্যাকিং, চালান ও লেবেল প্রিন্ট এবং কুরিয়ারে পার্সেল হ্যান্ডওভার করা।",
              permissions: [
                "View pending and confirmed customer orders",
                "Update order statuses (Processing, Shipped, Delivered)",
                "Export order lists (CSV/Excel) for packaging lists",
                "Generate courier consignments and print shipping labels",
                "Update inventory counts when stock arrives",
                "Perform delivery fraud checks on parcel recipients",
              ],
              permissionsBn: [
                "কনফার্ম হওয়া অর্ডারগুলোর তালিকা ও ঠিকানা দেখা",
                "অর্ডারের স্ট্যাটাস পরিবর্তন করা (যেমন: প্রসেসিং থেকে শিপড)",
                "প্যাকিংয়ের সুবিধার জন্য অর্ডার লিস্ট এক্সেল/সিএসভি ডাউনলোড করা",
                "কুরিয়ারে চালান তৈরি করা ও প্রিন্টেবল লেবেল বের করা",
                "নতুন স্টক আসলে ইনভেন্টরি আপডেট করা",
                "পার্সেল প্রাপকের রিস্ক হিস্ট্রি চেক করা",
              ],
              restrictions: [
                "Cannot view or reply to customer private chats or comments",
                "Cannot view shop profit margins, cash ledger, or billing",
                "Cannot edit product details or prices",
                "Cannot modify shop configurations or team members",
              ],
              restrictionsBn: [
                "কাস্টমারদের ব্যক্তিগত ইনবক্স চ্যাট বা কমেন্ট দেখার অনুমতি নেই",
                "শপের লাভ-ক্ষতি, হিসাব খাতা বা বিলিং দেখার কোনো সুযোগ নেই",
                "পণ্যের বিবরণ বা দাম এডিট করতে পারবেন না",
                "শপ সেটিংস বা টিম মেম্বারদের পরিবর্তনে কোনো এক্সেস নেই",
              ],
            },
            {
              role: "ACCOUNTANT",
              roleBn: "অ্যাকাউন্ট্যান্ট (Finance & Bookkeeping)",
              badge: "Finance",
              purpose: "Managing business revenue, expenses, Hisab Khata, and courier payment reconciliation.",
              purposeBn: "শপের আয়-ব্যয়, ক্যাশফ্লো, হিসাব খাতা ও কুরিয়ারের টাকার নির্ভুল হিসাব রাখা।",
              permissions: [
                "Full read and write access to Hisab Khata digital ledger",
                "Manage courier COD payment reconciliations",
                "View and export order revenue reports and billing invoices",
                "Track expenses, supplier payments, and merchant cash drawers",
                "View analytics dashboards and business audit logs",
                "Read-only access to customer orders and products",
              ],
              permissionsBn: [
                "ডিজিটাল হিসাব খাতায় এন্ট্রি দেওয়া ও ব্যালেন্স তদারকি করা",
                "কুরিয়ারের সিওডি পেমেন্ট শিট মেলানো (Reconciliation)",
                "অর্ডারের আর্থিক রিপোর্ট ও বিলিং রিসিট এক্সপোর্ট করা",
                "ব্যবসায়িক খরচ, সাপ্লায়ার পেমেন্ট ও ক্যাশের হিসাব রাখা",
                "সেলস অ্যানালিটিক্স ও সিস্টেমের অডিট লগ পরীক্ষা করা",
                "অর্ডার ও প্রোডাক্টের তালিকা দেখার অনুমতি",
              ],
              restrictions: [
                "Cannot reply to customer messages or post comments",
                "Cannot create new customer orders or edit product catalog",
                "Cannot dispatch consignments to couriers",
                "Cannot change subscription billing or store settings",
              ],
              restrictionsBn: [
                "কাস্টমারদের ইনবক্সে কোনো মেসেজ বা কমেন্ট পাঠানোর ক্ষমতা নেই",
                "নতুন প্রোডাক্ট তৈরি করতে বা ক্যাটালগ এডিট করতে পারবেন না",
                "কুরিয়ারে নতুন চালান পাঠাতে পারবেন না",
                "প্ল্যাটফর্মের মূল সেটিংস বা সাবস্ক্রিপশন পরিবর্তন করতে পারবেন না",
              ],
            },
            {
              role: "VIEWER",
              roleBn: "ভিউয়ার (Auditor / Silent Observer)",
              badge: "Read Only",
              purpose: "Read-only visibility for external partners, business auditors, or trainees.",
              purposeBn: "শুধুমাত্র দেখার অনুমতি—অডিটর, বিনিয়োগকারী বা নতুন ট্রেইনিদের জন্য।",
              permissions: [
                "Read-only visibility across products, customer list, and orders",
                "Read-only view of Hisab Khata ledger and comments",
                "View shop analytics and high-level performance metrics",
              ],
              permissionsBn: [
                "অর্ডার, কাস্টমার তালিকা ও প্রডাক্ট দেখার সাধারণ অনুমতি",
                "হিসাব খাতা ও কমেন্ট দেখার অনুমতি (কোনো পরিবর্তন ছাড়া)",
                "শপের ওভারঅল সেলস অ্যানালিটিক্স দেখার সুযোগ",
              ],
              restrictions: [
                "Zero write or edit permissions across all modules",
                "Cannot reply to customers or book consignments",
                "Cannot export confidential billing data",
              ],
              restrictionsBn: [
                "কোনো কিছু পরিবর্তন, ডিলিট বা এডিট করার ক্ষমতা নেই (সম্পূর্ণ Read-Only)",
                "কাস্টমারকে রিপ্লাই দেওয়া বা অর্ডার বুক করার ক্ষমতা নেই",
                "বিলিং বা পেমেন্ট সেটিংসে প্রবেশাধিকার নেই",
              ],
            },
          ],
        },
      },
    ],
  },

  "role-selection-guide": {
    id: "role-selection-guide",
    categoryId: "seller-invitation",
    categoryTitle: "Seller Invitation & Team Roles",
    categoryTitleBn: "সেলার ইনভাইটেশন ও টিম মেম্বার রোলস",
    title: "Role Recommendations & Use Cases",
    titleBn: "কোন কাজের জন্য কাকে কোন পদ দিবেন?",
    lead: "A practical guide to help you assign the perfect role to each employee or helper in your business.",
    leadBn: "আপনার শপের কর্মীদের দায়িত্ব অনুযায়ী সঠিক রোল বাছাই করার বাস্তবসম্মত পরামর্শ।",
    sections: [
      {
        heading: "Practical Scenarios",
        headingBn: "বাস্তব কর্মক্ষেত্র ও রোল নির্বাচন",
        bullets: [
          {
            title: "Hiring Facebook Page Chat Moderators?",
            titleBn: "ফেসবুক পেজের ইনবক্স রিপ্লাই দেওয়ার জন্য কর্মী?",
            text: "Assign the **AGENT** role. They can reply to Messenger messages, answer post comments, use the AI assistant, and immediately book orders when customers confirm. They won't see your profits or shop billing.",
            textBn: "তাদের **AGENT** রোল দিন। তারা মেসেজ ও কমেন্টের দ্রুত রিপ্লাই দিতে পারবেন এবং সরাসরি অর্ডার বুক করতে পারবেন। কিন্তু আপনার লাভ বা হিসাব খাতায় তাদের কোনো হাত থাকবে না।",
          },
          {
            title: "Hiring Warehouse / Packaging Helpers?",
            titleBn: "পার্সেল প্যাকিং ও কুরিয়ারে পাঠানোর কর্মী?",
            text: "Assign the **FULFILMENT** role. They can see confirmed delivery addresses, print shipping invoices, box the products, and dispatch parcels to Steadfast/Pathao. They will never see private chats or customer conversations.",
            textBn: "তাদের **FULFILMENT** রোল দিন। তারা শুধু প্যাকিং লিস্ট দেখতে পাবেন, চালান প্রিন্ট করবেন এবং কুরিয়ারে পাঠাবেন। কাস্টমারের সাথে ব্যক্তিগত চ্যাট তারা দেখতে পাবেন না।",
          },
          {
            title: "Have an In-House Accountant or Cashier?",
            titleBn: "দোকানের হিসাবরক্ষক বা ক্যাশিয়ার?",
            text: "Assign the **ACCOUNTANT** role. They can balance the daily Hisab Khata, record expenses, verify incoming courier COD payments, and export revenue reports.",
            textBn: "তাদের **ACCOUNTANT** রোল দিন। তারা প্রতিদিনের ক্যাশ জমা-খরচ লিখবেন, কুরিয়ারের ব্যাংক জমার সাথে পার্সেলের টাকা মেলাবেন এবং রিপোর্ট দেখবেন।",
          },
          {
            title: "Have a Store Manager or Partner?",
            titleBn: "দোকানের বিশ্বস্ত ম্যানেজার বা পার্টনার?",
            text: "Assign the **MANAGER** role. They have comprehensive supervision over team members, products, and order flows, but cannot touch your personal billing plan or delete the shop.",
            textBn: "তাদের **MANAGER** রোল দিন। তারা পুরো শপের কার্যক্রম তদারকি করতে পারবেন, তবে আপনার সাবস্ক্রিপশন প্ল্যান পরিবর্তন বা শপ ডিলিট করতে পারবেন না।",
          },
        ],
      },
    ],
  },

  "team-security-2fa": {
    id: "team-security-2fa",
    categoryId: "seller-invitation",
    categoryTitle: "Seller Invitation & Team Roles",
    categoryTitleBn: "সেলার ইনভাইটেশন ও টিম মেম্বার রোলস",
    title: "Team Security & 2FA Enforcement",
    titleBn: "টিম সিকিউরিটি ও ২-ফ্যাক্টর অথেনটিকেশন নির্দেশিকা",
    lead: "Follow best security practices to protect your business data and ensure safe delegation.",
    leadBn: "আপনার শপের সুরক্ষা বজায় রাখতে এবং নিরাপদ টিম পরিচালনার জন্য এই নিরাপত্তামূলক নির্দেশিকাগুলো মেনে চলুন।",
    sections: [
      {
        heading: "Security Commandments for Sellers",
        headingBn: "সেলারদের জন্য প্রধান নিরাপত্তামূলক নিয়মাবলী",
        bullets: [
          {
            title: "Always Require 2FA (Two-Factor Authentication)",
            titleBn: "২-ফ্যাক্টর অথেনটিকেশন বাধ্যতামূলক রাখুন",
            text: "Before inviting team members, ensure your account has 2FA enabled. This prevents unauthorized attackers from issuing invitations even if your personal password is leaked.",
            textBn: "টিম মেম্বারদের যুক্ত করার আগে আপনার প্রোফাইলে ২-ফ্যাক্টর অথেনটিকেশন সক্রিয় করুন। এতে পাসওয়ার্ড ফাঁস হলেও আপনার শপ সম্পূর্ণ সুরক্ষিত থাকবে।",
          },
          {
            title: "Principle of Least Privilege",
            titleBn: "প্রয়োজনের অতিরিক্ত এক্সেস না দেওয়া",
            text: "Always assign the lowest role necessary for an employee to do their job. For example, never make a chat moderator a Manager when the Agent role has everything they need.",
            textBn: "কর্মীকে শুধু তার কাজের উপযোগী রোলটি দিন। যেমন চ্যাট মডারেটরকে ম্যানেজার না দিয়ে এজেন্ট রোল দিন।",
          },
          {
            title: "Audit Logs & Accountability",
            titleBn: "অডিট লগ ও জবাবদিহিতা",
            text: "All important events (order edits, status changes, inventory updates) are permanently recorded in the system audit trail with the teammate's identity.",
            textBn: "কোন সদস্য কখন কোন পরিবর্তন করলেন তা অডিট লগে সংরক্ষিত থাকে। ফলে কেউ কোনো ভুল করলে তা সহজে চিহ্নিত করা যায়।",
          },
          {
            title: "Prompt Offboarding",
            titleBn: "কর্মী চলে গেলে তাৎক্ষণিক এক্সেস বাতিল",
            text: "When an employee leaves your organization, go to Dashboard > Settings > Team and click the Remove icon. Their access token is immediately invalidated.",
            textBn: "কোনো কর্মী চাকরি ছেড়ে দেওয়ার সাথে সাথে টিম পেজ থেকে তার রোল রিমুভ করে দিন। সাথে সাথে তার এক্সেস বন্ধ হয়ে যাবে।",
          },
        ],
      },
    ],
  },
};

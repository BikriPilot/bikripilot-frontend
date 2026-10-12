import { ExternalLink } from "lucide-react";

export function MessengerLogo({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M12 2C6.48 2 2 6.14 2 11.26c0 2.91 1.45 5.51 3.73 7.2V22l3.39-1.86c.9.25 1.87.39 2.88.39 5.52 0 10-4.14 10-9.27C22 6.14 17.52 2 12 2z"
        fill="url(#msg-grad)"
      />
      <path
        d="m6.8 13.6 3.1-4.9 2.6 2.6 3.7-3.9-3.1 4.9-2.6-2.6-3.7 3.9z"
        fill="#ffffff"
      />
      <defs>
        <linearGradient id="msg-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00B2FF" />
          <stop offset="0.5" stopColor="#006AFF" />
          <stop offset="1" stopColor="#9B30FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function FacebookLogo({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#1877F2" />
      <path
        d="M13.5 21.8v-7.6h2.5l.4-3h-2.9V9.3c0-.9.2-1.5 1.5-1.5h1.6V5.1c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.4v7.6c.5.1 1.1.1 1.6.1s1 0 1.5-.1z"
        fill="#ffffff"
      />
    </svg>
  );
}

export function LinkedInLogo({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect width="24" height="24" rx="4" fill="#0A66C2" />
      <path
        d="M7.4 9H4.6v9h2.8V9zm-1.4-4.2c-.9 0-1.6.7-1.6 1.6s.7 1.6 1.6 1.6 1.6-.7 1.6-1.6c0-.9-.7-1.6-1.6-1.6zm13.4 7.4c0-2.8-1.5-4.1-3.5-4.1-1.6 0-2.3.9-2.7 1.5V9h-2.8c.04.8 0 9 0 9h2.8v-5c0-.3 0-.5.1-.7.2-.6.7-1.2 1.6-1.2 1.1 0 1.6.9 1.6 2.1V18h2.8l.1-5.8z"
        fill="#ffffff"
      />
    </svg>
  );
}

export function WhatsAppLogo({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="#25D366" />
      <path
        d="M17.5 14.4c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.1-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5s-.7-1.7-1-2.3c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.2-1.2 2.9 1.2 3.4 1.4 3.6c.2.2 2.4 3.7 5.9 5.2.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 2.1-.9 2.4-1.7.3-.8.3-1.6.2-1.7-.1-.2-.3-.3-.6-.4z"
        fill="#ffffff"
      />
    </svg>
  );
}

export function SteadfastLogo({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="#059669" />
      <path
        d="M12 4.5l6.5 3.75v7.5L12 19.5 5.5 15.75v-7.5L12 4.5z"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 4.5v15M5.5 8.25l6.5 3.75 6.5-3.75"
        stroke="#ffffff"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.2" fill="#34D399" />
    </svg>
  );
}

export function PathaoLogo({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="#EC232B" />
      <path
        d="M7 6.5h5.5a4.2 4.2 0 0 1 4.2 4.2c0 2.3-1.9 4.2-4.2 4.2H10.2v3.6H7V6.5z"
        fill="#ffffff"
      />
      <path
        d="M10.2 9.4h2.5a1.4 1.4 0 0 1 1.4 1.4c0 .8-.6 1.4-1.4 1.4h-2.5V9.4z"
        fill="#EC232B"
      />
      <circle cx="16.5" cy="16.5" r="1.5" fill="#ffffff" />
    </svg>
  );
}

export function RedXLogo({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="#18181B" />
      <text
        x="4"
        y="16"
        fill="#ffffff"
        fontSize="10"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="-0.5"
      >
        RED
      </text>
      <path
        d="M15 8l2.2 3.8L19.5 8h2.3l-3.3 5.3 3.5 5.2h-2.3l-2.4-3.8-2.4 3.8h-2.2l3.4-5.2L12.8 8H15z"
        fill="#EB1C24"
      />
    </svg>
  );
}

export function BKashLogo({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="#E2136E" />
      <path
        d="M12.5 5.5l5 4.5-4 1.5-1-6z"
        fill="#ffffff"
        opacity="0.95"
      />
      <path
        d="M12.5 5.5l-6 6.5 7-.5-1-6z"
        fill="#ffffff"
      />
      <path
        d="M6.5 12l5.5 6.5 1.5-7-7 .5z"
        fill="#ffffff"
        opacity="0.88"
      />
      <path
        d="M13.5 11.5l4-1.5-2 7.5-2-6z"
        fill="#ffffff"
        opacity="0.75"
      />
    </svg>
  );
}

export function NagadLogo({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="url(#nagad-grad)" />
      <path
        d="M12 5.5a6.5 6.5 0 0 0-6.5 6.5c0 3.6 2.9 6.5 6.5 6.5s6.5-2.9 6.5-6.5c0-1.8-.7-3.4-1.9-4.6l-1.5 1.5a4.3 4.3 0 0 1 1.3 3.1 4.4 4.4 0 1 1-8.8 0 4.4 4.4 0 0 1 4.4-4.4V5.5z"
        fill="#ffffff"
      />
      <circle cx="12" cy="12" r="2.2" fill="#ffffff" />
      <defs>
        <linearGradient id="nagad-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F97316" />
          <stop offset="1" stopColor="#DC2626" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export interface PartnerIntegration {
  id: string;
  name: string;
  shortName: string;
  category: string;
  badge: string;
  url: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
}

export const PARTNERS: PartnerIntegration[] = [
  {
    id: "messenger",
    name: "Facebook Messenger",
    shortName: "Messenger",
    category: "Messaging",
    badge: "Official API",
    url: "https://www.messenger.com",
    description: "24/7 AI chat reply, order intake & comment bot",
    Icon: MessengerLogo,
  },
  {
    id: "facebook",
    name: "Facebook Pages",
    shortName: "Pages",
    category: "Meta Partner",
    badge: "Meta Webhook",
    url: "https://www.facebook.com",
    description: "Instant post comment sync and direct inbox routing",
    Icon: FacebookLogo,
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    shortName: "WhatsApp",
    category: "Messaging",
    badge: "Cloud API",
    url: "https://business.whatsapp.com",
    description: "Automated WhatsApp catalogue, order alerts & AI replies",
    Icon: WhatsAppLogo,
  },
  {
    id: "steadfast",
    name: "Steadfast Courier",
    shortName: "Steadfast",
    category: "Courier",
    badge: "Direct Sync",
    url: "https://steadfast.com.bd",
    description: "One-tap consignment creation & live tracking",
    Icon: SteadfastLogo,
  },
  {
    id: "pathao",
    name: "Pathao Courier",
    shortName: "Pathao",
    category: "Courier",
    badge: "API Booking",
    url: "https://pathao.com/courier",
    description: "Automated merchant parcel booking & delivery updates",
    Icon: PathaoLogo,
  },
  {
    id: "redx",
    name: "RedX Courier",
    shortName: "RedX",
    category: "Courier",
    badge: "API Booking",
    url: "https://redx.com.bd",
    description: "Nationwide pickup and COD collection sync",
    Icon: RedXLogo,
  },
  {
    id: "bkash",
    name: "bKash",
    shortName: "bKash",
    category: "MFS Payment",
    badge: "Auto Match",
    url: "https://www.bkash.com",
    description: "Merchant & personal statement reconciliation",
    Icon: BKashLogo,
  },
  {
    id: "nagad",
    name: "Nagad",
    shortName: "Nagad",
    category: "MFS Payment",
    badge: "Auto Match",
    url: "https://nagad.com.bd",
    description: "Instant payment entry into Hisab Khata ledger",
    Icon: NagadLogo,
  },
];

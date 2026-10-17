<div align="center">

# 🚀 BikriPilot Frontend

### The AI-Powered Conversational Commerce & Operations Engine for Next-Gen Merchants

[![Live Platform](https://img.shields.io/badge/Live%20Platform-bikripilot.app-2563EB?style=for-the-badge&logo=googlechrome&logoColor=white)](https://bikripilot.app)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.x-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](LICENSE)

<br/>

**[🌐 Visit Official Website](https://bikripilot.app)** • **[📩 Contact Founder](mailto:founder@bikripilot.app)** • **[⚡ Request Demo](https://bikripilot.app)**

---

</div>

## 📌 Executive Summary

**BikriPilot** is an all-in-one conversational commerce, AI sales automation, and fulfillment operating system engineered specifically for emerging social commerce (F-Commerce & D2C) markets. 

In emerging economies, over **70% of online retail takes place inside social messaging channels** (Facebook Messenger, WhatsApp, Instagram). However, merchants waste thousands of hours manually answering chats, jotting down addresses, booking couriers, and suffering heavy losses from fake orders and COD (Cash-on-Delivery) return rates.

**BikriPilot solves this end-to-end** through an ultra-responsive, real-time web application featuring AI sales agents, conversational checkout extraction, 1-click multi-courier dispatch, algorithmic fraud scoring, and automated accounting (*Hisab Khata*).

---

## 🌟 Key Capabilities & Core Pillars

### 🤖 1. Omnichannel AI Sales Agent & Unified Inbox
- **24/7 Intelligent Automation:** Autonomous AI agent answers customer queries, suggests products, and resolves inquiries round-the-clock without manual human intervention.
- **Social Comment-to-Inbox Pipeline:** Automatically captures and responds to public product queries on Facebook posts and converts them into sales leads.
- **Real-time Live Chat:** Seamless bi-directional messaging powered by WebSockets (`socket.io-client`), allowing instant agent takeover at any point.

### ⚡ 2. One-Click Conversational Order Generation
- **Intelligent Entity Extraction:** Extracts customer name, phone number, delivery address, and product details directly from unformatted chat messages into verified order drafts in seconds.
- **Zero Manual Data Entry:** Eliminates order logging errors and slashes order processing time from 5 minutes to under 10 seconds.

### 🚚 3. Deep Courier Logistics & Fraud Shield Engine
- **Native Courier Integrations:** Direct dispatch with leading courier networks (**Steadfast, Pathao, RedX**) without switching merchant tabs.
- **Delivery Success Rating (Fraud Detection):** Predictive scoring on customer phone numbers cross-referenced against historical delivery trends to prevent chronic returners, pranks, and high-risk fake orders.
- **Real-Time Parcel Tracking:** Live courier status sync directly to customer tickets and merchant analytics.

### 📊 4. Automated Ledger & Financial Khata
- **COD Reconciliation:** Automated cash-flow monitoring comparing courier payouts against pending orders.
- **Receivables & Payables Tracking:** Built-in digital *Hisab Khata* providing clarity on customer dues, operational expenses, and net profit margins.

### 🌐 5. Native Dual-Language Support (i18n)
- Comprehensive English & Bengali (বাংলা) localization across every customer-facing and merchant-facing screen using `next-intl`.

---

## 🏗️ Architecture & Technology Stack

The BikriPilot frontend is engineered for sub-second latency, rigorous type safety, modular maintainability, and clean separation of concerns.

```
┌─────────────────────────────────────────────────────────────────┐
│                       Next.js 16 App Router                     │
│   (Server Components + Streaming SSR + Dynamic Client Islands)  │
└───────────────┬─────────────────────────────────┬───────────────┘
                │                                 │
     ┌──────────▼──────────┐           ┌──────────▼──────────┐
     │  State & API Sync   │           │  UI & User Styling  │
     │  • TanStack Query   │           │  • Tailwind CSS v4  │
     │  • Zustand Stores   │           │  • Lucide Icons     │
     │  • Axios Client     │           │  • Recharts Visuals │
     │  • Socket.io-client │           │  • next-themes (UI) │
     └──────────┬──────────┘           └──────────┬──────────┘
                │                                 │
     ┌──────────▼─────────────────────────────────▼──────────┐
     │                Security, Quality & Forms              │
     │  • React Hook Form + Zod Schema Validation            │
     │  • Cloudflare Turnstile Bot Protection               │
     │  • next-intl Localization (EN / BN)                   │
     │  • Vitest + Testing Library Unit Verification         │
     └───────────────────────────────────────────────────────┘
```

| Layer | Technologies & Tools |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack support, Server Actions & Server Components) |
| **Core Runtime** | [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/), [next-themes](https://github.com/pacocoursey/next-themes) (Dark/Light mode) |
| **State Management** | [Zustand v5](https://github.com/pmndrs/zustand) (Client Global State), [TanStack Query v5](https://tanstack.com/query) (Server State & Cache) |
| **Data & Forms** | [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) (Strict Runtime Validation), [Axios](https://axios-http.com/) |
| **Realtime Engine** | [Socket.io-client](https://socket.io/) for live chats, instant alerts, and status sync |
| **Analytics & Charts**| [Recharts](https://recharts.org/) for business growth metrics, revenue, and courier delivery trends |
| **Security** | [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) (`@marsidev/react-turnstile`) enterprise bot protection |
| **Localization** | [next-intl](https://next-intl-docs.vercel.app/) (English & Bengali / বাংলা) |
| **Quality & Tests** | [Vitest](https://vitest.dev/), [@testing-library/react](https://testing-library.com/), ESLint 9, Prettier |

---

## 📂 Project Directory Structure

```plaintext
frontend/
├── messages/                 # i18n localization translation catalogs (en.json, bn.json)
├── public/                   # Static assets, brand logos, badges, and marketing media
├── scripts/                  # Development automation scripts (e.g., i18n validator)
├── tests/                    # Unit and integration test suites (Vitest + Testing Library)
└── src/
    ├── app/                  # Next.js App Router root
    │   ├── (auth)/           # Authentication routes (Login, Signup, Recovery)
    │   ├── (public)/         # Public landing page, pricing, documentation, terms
    │   ├── admin/            # Platform administration & system monitoring
    │   ├── dashboard/        # Merchant workspace & operational command center
    │   │   ├── (customers)/  # Customer directory & delivery profiles
    │   │   ├── (hisab)/      # Digital Khata, ledger, COD & payout reconciliation
    │   │   ├── (inbox)/      # Unified omnichannel live chat & AI assistant
    │   │   ├── (orders)/     # Order lifecycle, status board & parcel dispatch
    │   │   ├── (products)/   # Inventory, catalog & SKU management
    │   │   ├── (settings)/   # Channel integrations, couriers & workspace setup
    │   │   ├── ai/           # AI bot persona, prompt rules & automated behavior
    │   │   ├── analytics/    # Executive metrics, sales reports & cohort analytics
    │   │   └── sms-email/    # Customer campaign broadcasts & transactional alerts
    │   ├── layout.tsx        # Root layout with theme providers & i18n wrappers
    │   └── providers.tsx     # Global context providers (React Query, Theme, Toasts)
    ├── components/           # Reusable UI component design system
    │   ├── common/           # Shared atomic components (Modals, Buttons, Badges)
    │   ├── dashboard/        # Merchant-specific modular widgets
    │   ├── landing/          # High-converting marketing landing page components
    │   └── layout/           # App sidebars, headers, guards (AuthGuard, GuestGuard)
    ├── config/               # Application-level configurations & feature flags
    ├── hooks/                # Custom React hooks (useSocket, useAuth, useDebounce)
    ├── lib/                  # Utility libraries, HTTP client instances, helpers
    ├── stores/               # Zustand persistent and volatile application stores
    └── types/                # Strongly-typed TypeScript interfaces and data models
```

---

## 🚦 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js:** `v20.x` or higher (LTS recommended)
- **Package Manager:** `npm` (v10+), `pnpm`, or `yarn`

### 1. Clone & Navigate to Project

```bash
git clone https://github.com/bikripilot/bikripilot-frontend.git
cd bikripilot-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create your local environment file based on `.env.example`:

```bash
cp .env.example .env.local
```

Adjust the values in `.env.local`:

```env
# Backend REST API Endpoint
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

# Realtime WebSocket Server
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000

# Frontend Web Origin
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Cloudflare Turnstile Bot Protection (Optional in local dev)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🧪 Testing & Verification Suite

We uphold strict continuous quality control standards. Before merging or submitting pull requests, run our automated verification pipeline:

| Command | Purpose |
| :--- | :--- |
| `npm run typecheck` | Validates TypeScript types across the entire codebase (`tsc --noEmit`) |
| `npm run lint` | Runs ESLint 9 checks to enforce code conventions and clean syntax |
| `npm run test` | Executes unit and component tests via [Vitest](https://vitest.dev/) |
| `npm run i18n:check` | Verifies translation parity between English and Bengali dictionary keys |
| `npm run verify` | Runs the complete validation pipeline (lint + typecheck + i18n + test + build) |

```bash
# Run the complete test & typecheck suite
npm run verify
```

---

## 🔒 Security, Performance & Reliability

- **Enterprise Bot Defense:** Integrated Cloudflare Turnstile verification prevents credential stuffing and brute-force attacks on public endpoints.
- **Zero Secret Exposure:** Zero sensitive keys in client bundles; all sensitive transactions route through hardened server-side endpoints with granular CORS enforcement.
- **Resilient Offline / Hydration Handling:** Optimistic UI updates with automatic cache invalidation and rollback patterns powered by TanStack Query.
- **Fast Core Web Vitals:** Static rendering where possible, dynamic code splitting with Next.js App Router, and font optimization via `next/font`.

---

## 📈 Traction & Milestones

- 🚀 **Live Production Release:** Deployed and actively serving merchants at [bikripilot.app](https://bikripilot.app).
- 📦 **Logistics Coverage:** Complete integration with Steadfast, Pathao, and RedX couriers.
- 💬 **Conversational AI:** High-precision intent recognition for order taking, addressing, and real-time social inquiry replies.
- 🌍 **Market Expansion:** Expanding across South Asia and Southeast Asia high-growth social commerce corridors.

---

## 📬 Founder & Investor Contact

We are actively scaling BikriPilot and welcome conversations with startup accelerators, prospective partners, and investors.

- **Founder & Team:** Founder Office
- **Direct Email:** [founder@bikripilot.app](mailto:founder@bikripilot.app)
- **Official Website:** [https://bikripilot.app](https://bikripilot.app)
- **Product Inquiries:** [hello@bikripilot.app](mailto:founder@bikripilot.app)

---

<div align="center">

Made with ❤️ by the **BikriPilot Team** • Empowering Modern Commerce Merchants

© 2026 BikriPilot. All rights reserved.

</div>

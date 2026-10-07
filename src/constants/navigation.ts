import {
  Home,
  LifeBuoy,
  MessageSquare,
  Package,
  Settings,
  Users,
  BookOpen,
  ShoppingCart,
  Bot,
  type LucideIcon,
} from "lucide-react";

export interface SubNavItem {
  key: string;
  href: string;
  labelKey: string;
  permission?: string;
  exact?: boolean;
}

export interface NavSection {
  key: string;
  href: string;
  icon: LucideIcon;
  labelKey: string;
  mobile: "bottom" | "more";
  badge?: "unreadConversations" | "pendingOrders";
  subNav: SubNavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    key: "inbox",
    href: "/dashboard/inbox",
    icon: MessageSquare,
    labelKey: "inbox",
    mobile: "bottom",
    badge: "unreadConversations",
    subNav: [
      {
        key: "messages",
        href: "/dashboard/inbox",
        labelKey: "messages",
        permission: "inbox.read",
        exact: true,
      },
      {
        key: "comments",
        href: "/dashboard/comments",
        labelKey: "comments",
        permission: "comment.read",
      },
      {
        key: "automation",
        href: "/dashboard/automation",
        labelKey: "automation",
        permission: "automation.manage",
      },
    ],
  },
  {
    key: "orders",
    href: "/dashboard/orders",
    icon: ShoppingCart,
    labelKey: "orders",
    mobile: "bottom",
    subNav: [
      {
        key: "orders",
        href: "/dashboard/orders",
        labelKey: "orders",
        permission: "order.read",
        exact: true,
      },
      {
        key: "shipments",
        href: "/dashboard/shipments",
        labelKey: "shipments",
        permission: "order.read",
      },
      {
        key: "couriers",
        href: "/dashboard/couriers",
        labelKey: "couriers",
        permission: "order.read",
      },
    ],
  },
  {
    key: "hisab",
    href: "/dashboard/hisab",
    icon: BookOpen,
    labelKey: "hisab",
    mobile: "bottom",
    subNav: [
      {
        key: "hisab",
        href: "/dashboard/hisab",
        labelKey: "hisab",
        permission: "hisab.read",
        exact: true,
      },
    ],
  },
  {
    key: "customers",
    href: "/dashboard/customers",
    icon: Users,
    labelKey: "customers",
    mobile: "more",
    subNav: [
      {
        key: "customers",
        href: "/dashboard/customers",
        labelKey: "customers",
        permission: "customer.read",
        exact: true,
      },
      {
        key: "risk",
        href: "/dashboard/risk",
        labelKey: "riskCheck",
        permission: "customer.read",
      },
    ],
  },
  {
    key: "products",
    href: "/dashboard/products",
    icon: Package,
    labelKey: "products",
    mobile: "bottom",
    subNav: [
      {
        key: "products",
        href: "/dashboard/products",
        labelKey: "products",
        permission: "product.read",
        exact: true,
      },
      {
        key: "inventory",
        href: "/dashboard/inventory",
        labelKey: "inventory",
        permission: "product.read",
      },
    ],
  },
  {
    key: "home",
    href: "/dashboard",
    icon: Home,
    labelKey: "home",
    mobile: "bottom",
    subNav: [],
  },
  {
    key: "ai",
    href: "/dashboard/ai",
    icon: Bot,
    labelKey: "ai",
    mobile: "more",
    subNav: [
      {
        key: "businessInfo",
        href: "/dashboard/ai",
        labelKey: "businessInfo",
        permission: "ai.use",
        exact: true,
      },
      {
        key: "settings",
        href: "/dashboard/ai/settings",
        labelKey: "settings",
        permission: "ai.use",
      },
      {
        key: "knowledge",
        href: "/dashboard/ai/knowledge",
        labelKey: "knowledge",
        permission: "ai.use",
      },
      {
        key: "playground",
        href: "/dashboard/ai/playground",
        labelKey: "playground",
        permission: "ai.use",
      },
      {
        key: "usage",
        href: "/dashboard/ai/usage",
        labelKey: "usage",
        permission: "ai.use",
      },
    ],
  },
  {
    key: "settings",
    href: "/dashboard/settings",
    icon: Settings,
    labelKey: "settings",
    mobile: "more",
    subNav: [
      {
        key: "shop",
        href: "/dashboard/settings",
        labelKey: "settingsShop",
        permission: "shop.read",
        exact: true,
      },
      {
        key: "delivery",
        href: "/dashboard/settings/delivery",
        labelKey: "settingsDelivery",
        permission: "shop.read",
      },
      {
        key: "team",
        href: "/dashboard/team",
        labelKey: "team",
        permission: "team.read",
      },
      {
        key: "billing",
        href: "/dashboard/billing",
        labelKey: "billing",
        permission: "billing.read",
      },
      {
        key: "hisabSettings",
        href: "/dashboard/settings/hisab",
        labelKey: "settingsHisab",
        permission: "hisab.read",
      },
      {
        key: "channels",
        href: "/dashboard/channels",
        labelKey: "settingsChannels",
        permission: "shop.read",
      },
      {
        key: "riskSettings",
        href: "/dashboard/settings/risk",
        labelKey: "settingsRisk",
        permission: "shop.read",
      },
    ],
  },
];

export const NAV_FOOTER_ITEMS = [
  { key: "help", href: "/dashboard/help", icon: LifeBuoy, labelKey: "help" },
] as const;

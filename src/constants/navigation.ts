import { Home, LifeBuoy, Package, Settings, Users, BookOpen, ShoppingCart, type LucideIcon } from "lucide-react";
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
  subNav: SubNavItem[];
}
export const NAV_SECTIONS: NavSection[] = [
  {
    key: "orders", href: "/dashboard/orders", icon: ShoppingCart, labelKey: "orders", mobile: "bottom",
    subNav: [{ key: "orders", href: "/dashboard/orders", labelKey: "orders", permission: "order.read", exact: true }],
  },
  {
    key: "hisab", href: "/dashboard/hisab", icon: BookOpen, labelKey: "hisab", mobile: "bottom",
    subNav: [{ key: "hisab", href: "/dashboard/hisab", labelKey: "hisab", permission: "hisab.read", exact: true }],
  },
  {
    key: "customers",
    href: "/dashboard/customers",
    icon: Users,
    labelKey: "customers",
    mobile: "more",
    subNav: [
      { key: "customers", href: "/dashboard/customers", labelKey: "customers", permission: "customer.read", exact: true },
    ],
  },
  {
    key: "products",
    href: "/dashboard/products",
    icon: Package,
    labelKey: "products",
    mobile: "bottom",
    subNav: [
      { key: "products", href: "/dashboard/products", labelKey: "products", permission: "product.read", exact: true },
      { key: "inventory", href: "/dashboard/inventory", labelKey: "inventory", permission: "product.read" },
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
      { key: "hisabSettings", href: "/dashboard/settings/hisab", labelKey: "settingsHisab", permission: "hisab.read" },
    ],
  },
];

export const NAV_FOOTER_ITEMS = [
  { key: "help", href: "/dashboard/help", icon: LifeBuoy, labelKey: "help" },
] as const;

import { Home, Settings, type LucideIcon } from "lucide-react";
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
    ],
  },
];

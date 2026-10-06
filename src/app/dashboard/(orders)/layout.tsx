import { SectionSubNav } from "@/components/layout/SectionSubNav";
export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <><SectionSubNav sectionKey="orders" />{children}</>;
}

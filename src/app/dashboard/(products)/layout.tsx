import { SectionSubNav } from "@/components/layout/SectionSubNav";
export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <><SectionSubNav sectionKey="products" />{children}</>;
}

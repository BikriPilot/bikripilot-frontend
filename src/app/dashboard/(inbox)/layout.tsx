import { SectionSubNav } from "@/components/layout/SectionSubNav";

export default function InboxSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SectionSubNav sectionKey="inbox" />
      {children}
    </>
  );
}

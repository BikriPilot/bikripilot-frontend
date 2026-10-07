import { SectionSubNav } from '@/components/layout/SectionSubNav';

export default function AiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SectionSubNav sectionKey="ai" />
      <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">{children}</div>
    </>
  );
}

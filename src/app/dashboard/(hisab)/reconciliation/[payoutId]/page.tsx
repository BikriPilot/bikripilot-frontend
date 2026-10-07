import PayoutDetail from "@/components/reconciliation/PayoutDetail";

export default async function Page({
  params,
}: {
  params: Promise<{ payoutId: string }>;
}) {
  const { payoutId } = await params;
  return <PayoutDetail payoutId={payoutId} />;
}

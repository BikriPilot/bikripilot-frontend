import { AdminWorkspace } from "@/components/admin/AdminWorkspace";

export default async function AdminOrderPage({
  params,
}: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return <AdminWorkspace screen="orderDetail" id={orderId} />;
}

import { AdminWorkspace } from "@/components/admin/AdminWorkspace";

export default async function AdminShopPage({
  params,
}: { params: Promise<{ shopId: string }> }) {
  const { shopId } = await params;
  return <AdminWorkspace screen="shopDetail" id={shopId} />;
}

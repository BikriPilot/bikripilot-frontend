import { AdminWorkspace } from "@/components/admin/AdminWorkspace";

export default async function AdminPlanPage({
  params,
}: { params: Promise<{ planId: string }> }) {
  const { planId } = await params;
  return <AdminWorkspace screen="planDetail" id={planId} />;
}

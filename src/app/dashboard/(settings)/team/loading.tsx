import { TableSkeleton } from "@/components/common/skeletons";
export default function Loading() {
  return <TableSkeleton rows={5} cols={4} />;
}

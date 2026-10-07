import { InboxSkeleton } from "@/components/common/skeletons";

export default function Loading() {
  return (
    <div className="p-4 md:p-6">
      <InboxSkeleton />
    </div>
  );
}

import { ChatThreadSkeleton } from "@/components/common/skeletons";

export default function Loading() {
  return (
    <div className="flex h-full flex-col bg-background p-6">
      <ChatThreadSkeleton />
    </div>
  );
}

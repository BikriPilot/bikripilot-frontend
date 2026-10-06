import { FormSkeleton } from "@/components/common/skeletons";
export default function Loading() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <FormSkeleton fields={4} />
    </main>
  );
}

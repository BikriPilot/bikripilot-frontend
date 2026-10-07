"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { ConversationList } from "@/components/inbox/ConversationList";
import { useInboxRealtime } from "@/hooks/queries/useInbox";

export default function InboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();

  const conversationId = typeof params?.conversationId === "string" ? params.conversationId : null;
  const isMobileListOnly = pathname === "/dashboard/inbox";

  // Activate realtime socket listener for new messages & updates
  useInboxRealtime(conversationId);

  const handleSelectConversation = (id: string) => {
    router.push(`/dashboard/inbox/${id}`);
  };

  return (
    <div className="flex h-[calc(100dvh-56px)] md:h-[calc(100dvh-136px)] w-full overflow-hidden rounded-none md:rounded-2xl md:border bg-card shadow-xs">
      {/* Left Pane: Conversation List */}
      <div
        className={`w-full md:w-[340px] xl:w-[360px] shrink-0 h-full ${
          isMobileListOnly ? "flex" : "hidden md:flex"
        }`}
      >
        <ConversationList
          activeId={conversationId}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      {/* Main / Right Pane: Thread or Placeholder or Mobile View */}
      <div
        className={`flex-1 min-w-0 h-full ${
          isMobileListOnly ? "hidden md:flex flex-col" : "flex flex-col"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

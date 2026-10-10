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

  const conversationId =
    typeof params?.conversationId === "string" ? params.conversationId : null;
  const isMobileListOnly = pathname === "/dashboard/inbox";

  // Activate realtime socket listener for new messages & updates
  useInboxRealtime(conversationId);

  const handleSelectConversation = (id: string) => {
    router.push(`/dashboard/inbox/${id}`);
  };

  return (
    <div
      className={`flex w-full min-h-0 overflow-hidden bg-card md:rounded-lg md:border md:h-[calc(100dvh-192px)] ${isMobileListOnly ? "h-[calc(100dvh-240px)] min-h-80" : "fixed inset-0 z-40 h-dvh md:static"}`}
    >
      {/* Left Pane: Conversation List */}
      <div
        className={`w-full md:w-[300px] xl:w-[340px] shrink-0 h-full min-h-0 ${
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

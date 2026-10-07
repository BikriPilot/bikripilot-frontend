"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useConversation } from "@/hooks/queries/useInbox";
import { MessageThread } from "@/components/inbox/MessageThread";
import { CustomerPanel } from "@/components/inbox/CustomerPanel";

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = String(params?.conversationId ?? "");

  const { data: conversation } = useConversation(conversationId);

  // By default, open on desktop (>= 1280px) and closed on smaller screens
  const [isCustomerPanelOpen, setIsCustomerPanelOpen] = useState(false);
  const [isDesktopXl, setIsDesktopXl] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      const isXl = window.innerWidth >= 1280;
      setIsDesktopXl(isXl);
      // Auto-open on desktop initial load
      if (isXl) {
        setIsCustomerPanelOpen(true);
      }
    };

    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="flex-1 min-w-0 h-full flex flex-col">
        <MessageThread
          conversationId={conversationId}
          onBack={() => router.push("/dashboard/inbox")}
          onToggleCustomerPanel={() => setIsCustomerPanelOpen((prev) => !prev)}
          isCustomerPanelOpen={isCustomerPanelOpen}
        />
      </div>

      {conversation && (
        <CustomerPanel
          conversation={conversation}
          isOpen={isCustomerPanelOpen}
          onClose={() => setIsCustomerPanelOpen(false)}
          isMobileOrDrawer={!isDesktopXl}
        />
      )}
    </div>
  );
}

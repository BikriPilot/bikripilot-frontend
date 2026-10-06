"use client";
import { useParams } from "next/navigation";
import { DetailSkeleton } from "@/components/common/skeletons";
import { ErrorState } from "@/components/common/PageStates";
import { useOrder } from "@/hooks/queries/useOrders";
import { InvoicePrint } from "@/components/orders/InvoicePrint";
export default function OrderPrintPage() { const params = useParams<{ orderId: string }>(); const query = useOrder(params.orderId); if (query.isPending) return <DetailSkeleton />; if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />; return <InvoicePrint order={query.data} />; }

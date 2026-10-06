"use client";
import { useParams } from "next/navigation";
import { OrderDetail } from "@/components/orders/OrderDetail";
export default function OrderDetailPage() { const params = useParams<{ orderId: string }>(); return <OrderDetail orderId={params.orderId} />; }

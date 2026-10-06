import { use } from "react";
import { CustomerDetail } from "@/components/customers/CustomerDetail";
export default function CustomerPage({ params }: { params: Promise<{ customerId: string }> }) { return <CustomerDetail id={use(params).customerId} />; }

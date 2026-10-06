"use client";
import { useParams } from "next/navigation";
import { ProductForm } from "@/components/products/ProductForm";
import { ErrorState } from "@/components/common/PageStates";
import { DetailSkeleton } from "@/components/common/skeletons";
import { useProduct } from "@/hooks/queries/useProducts";
export default function ProductDetailPage() {
  const params = useParams<{ productId: string }>();
  const query = useProduct(params.productId);
  if (query.isPending) return <DetailSkeleton />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;
  return <ProductForm product={query.data} />;
}

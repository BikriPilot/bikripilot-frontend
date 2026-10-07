'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Layers, X } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState, ErrorState } from '@/components/common/PageStates';
import { ResponsiveListSkeleton } from '@/components/common/skeletons';
import { BookShipmentDialog } from '@/components/couriers/BookShipmentDialog';
import { BulkBookDialog } from '@/components/couriers/BulkBookDialog';
import { useOrders } from '@/hooks/queries/useOrders';
import { OrderCard } from './OrderCard';
import { OrderTable } from './OrderTable';
import type { OrderListItemDTO } from '@/types/order';

export function OrderList() {
  const t = useTranslations('orders');
  const tShip = useTranslations('shipments');
  const query = useOrders({ page: 1, limit: 50, sort: 'createdAt', order: 'desc' });
  const items = query.data?.data ?? [];

  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [singleBookOrder, setSingleBookOrder] = useState<OrderListItemDTO | null>(null);

  const handleToggleSelect = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedOrderIds.length === items.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(items.map((i) => i.id));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        action={
          <Link
            href="/dashboard/orders/new"
            className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {t('newOrder')}
          </Link>
        }
      />

      {/* Floating Bulk Action Bar */}
      {selectedOrderIds.length > 0 && (
        <div className="sticky top-4 z-30 flex items-center justify-between rounded-xl border border-primary/20 bg-card p-3 shadow-md backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
              {selectedOrderIds.length}
            </span>
            <span className="text-sm font-medium">
              {tShip('bulk.selectedCount', { count: selectedOrderIds.length })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBulkDialogOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Layers size={14} />
              {tShip('bulkBook')}
            </button>
            <button
              type="button"
              onClick={() => setSelectedOrderIds([])}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Clear selection"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {query.isPending ? (
        <ResponsiveListSkeleton />
      ) : query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          title={t('empty')}
          action={
            <Link
              href="/dashboard/orders/new"
              className="inline-flex min-h-11 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              {t('newOrder')}
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid gap-3 md:hidden">
            {items.map((item) => (
              <OrderCard
                key={item.id}
                item={item}
                selected={selectedOrderIds.includes(item.id)}
                onToggleSelect={handleToggleSelect}
                onBookCourier={(ord) => setSingleBookOrder(ord)}
              />
            ))}
          </div>
          <div className="hidden md:block">
            <OrderTable
              items={items}
              selectedIds={selectedOrderIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onBookCourier={(ord) => setSingleBookOrder(ord)}
            />
          </div>
        </>
      )}

      {/* Bulk Book Dialog */}
      <BulkBookDialog
        orderIds={selectedOrderIds}
        open={bulkDialogOpen}
        onClose={() => setBulkDialogOpen(false)}
        onSuccess={() => {
          setSelectedOrderIds([]);
          void query.refetch();
        }}
      />

      {/* Single Order Book Dialog */}
      {singleBookOrder && (
        <BookShipmentDialog
          order={singleBookOrder}
          open={Boolean(singleBookOrder)}
          onClose={() => {
            setSingleBookOrder(null);
            void query.refetch();
          }}
        />
      )}
    </div>
  );
}

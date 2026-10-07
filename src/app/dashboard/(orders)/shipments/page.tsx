'use client';

import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/common/PageHeader';
import { ShipmentTable } from '@/components/couriers/ShipmentTable';

export default function ShipmentsPage() {
  const t = useTranslations('shipments');

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
      />
      <ShipmentTable />
    </div>
  );
}

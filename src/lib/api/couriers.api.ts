import { api } from '@/lib/api/client';
import type {
  BookShipmentInput,
  BulkBookShipmentInput,
  BulkResultDTO,
  CancelShipmentInput,
  CourierConnectionDTO,
  CourierLocationDTO,
  CreateCourierConnectionInput,
  ManualShipmentInput,
  ShipmentDTO,
  ShipmentListQuery,
  UpdateCourierConnectionInput,
  UpdateManualStatusInput,
} from '@/types/courier';
import type { PageMeta } from '@/types/product';

const courierPath = (shopId: string, suffix = '') => `/shops/${shopId}/couriers${suffix}`;
const shipmentPath = (shopId: string, suffix = '') => `/shops/${shopId}/shipments${suffix}`;

export const couriersApi = {
  // Couriers
  listConnections: (shopId: string) =>
    api.get<{ data: CourierConnectionDTO[] }>(courierPath(shopId)).then((r) => r.data.data),

  createConnection: (shopId: string, input: CreateCourierConnectionInput) =>
    api.post<{ data: CourierConnectionDTO }>(courierPath(shopId), input).then((r) => r.data.data),

  updateConnection: (shopId: string, courierId: string, input: UpdateCourierConnectionInput) =>
    api.patch<{ data: CourierConnectionDTO }>(courierPath(shopId, `/${courierId}`), input).then((r) => r.data.data),

  deleteConnection: (shopId: string, courierId: string) =>
    api.delete<{ data: null }>(courierPath(shopId, `/${courierId}`)).then((r) => r.data.data),

  testConnection: (shopId: string, courierId: string) =>
    api.post<{ data: { ok: boolean; message: string; balancePaisa?: number } }>(
      courierPath(shopId, `/${courierId}/test`),
    ).then((r) => r.data.data),

  listLocations: (
    shopId: string,
    courierId: string,
    params: { type: 'city' | 'zone' | 'area'; parentId?: string | number; district?: string },
  ) =>
    api.get<{ data: CourierLocationDTO[] }>(courierPath(shopId, `/${courierId}/locations`), { params }).then((r) => r.data.data),

  // Shipments
  listShipments: (shopId: string, query: ShipmentListQuery = {}) =>
    api.get<{ data: ShipmentDTO[]; meta: PageMeta }>(shipmentPath(shopId), { params: query }).then((r) => r.data),

  getShipment: (shopId: string, shipmentId: string) =>
    api.get<{ data: ShipmentDTO }>(shipmentPath(shopId, `/${shipmentId}`)).then((r) => r.data.data),

  bookShipment: (shopId: string, input: BookShipmentInput) =>
    api.post<{ data: ShipmentDTO }>(shipmentPath(shopId), input).then((r) => r.data.data),

  bulkBook: (shopId: string, input: BulkBookShipmentInput) =>
    api.post<{ data: BulkResultDTO }>(shipmentPath(shopId, '/bulk'), input).then((r) => r.data.data),

  manualShipment: (shopId: string, input: ManualShipmentInput) =>
    api.post<{ data: ShipmentDTO }>(shipmentPath(shopId, '/manual'), input).then((r) => r.data.data),

  updateManualStatus: (shopId: string, shipmentId: string, input: UpdateManualStatusInput) =>
    api.patch<{ data: ShipmentDTO }>(shipmentPath(shopId, `/${shipmentId}/status`), input).then((r) => r.data.data),

  syncShipment: (shopId: string, shipmentId: string) =>
    api.post<{ data: ShipmentDTO }>(shipmentPath(shopId, `/${shipmentId}/sync`)).then((r) => r.data.data),

  cancelShipment: (shopId: string, shipmentId: string, input: CancelShipmentInput = {}) =>
    api.post<{ data: ShipmentDTO }>(shipmentPath(shopId, `/${shipmentId}/cancel`), input).then((r) => r.data.data),
};

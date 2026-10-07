'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { couriersApi } from '@/lib/api/couriers.api';
import { useCurrentShop } from '@/hooks/useCurrentShop';
import { queryKeys } from '@/lib/queryKeys';
import type {
  BookShipmentInput,
  BulkBookShipmentInput,
  CancelShipmentInput,
  CreateCourierConnectionInput,
  ManualShipmentInput,
  ShipmentListQuery,
  UpdateCourierConnectionInput,
  UpdateManualStatusInput,
} from '@/types/courier';

export function useCouriers() {
  const { shopId } = useCurrentShop();
  return useQuery({
    queryKey: queryKeys.couriers(shopId),
    queryFn: () => couriersApi.listConnections(shopId!),
    enabled: Boolean(shopId),
  });
}

export function useCourierLocations(
  courierId: string | null | undefined,
  type: 'city' | 'zone' | 'area',
  parentId?: string | number,
  district?: string,
) {
  const { shopId } = useCurrentShop();
  return useQuery({
    queryKey: queryKeys.courierLocations(shopId, courierId, type, parentId, district),
    queryFn: () =>
      couriersApi.listLocations(shopId!, courierId!, { type, parentId, district }),
    enabled: Boolean(shopId && courierId && (type === 'city' || type === 'area' || parentId)),
    staleTime: 5 * 60 * 1000, // Locations rarely change, cache for 5 min
  });
}

export function useCreateCourier() {
  const { shopId } = useCurrentShop();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCourierConnectionInput) =>
      couriersApi.createConnection(shopId!, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.couriers(shopId),
      });
    },
  });
}

export function useUpdateCourier() {
  const { shopId } = useCurrentShop();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courierId, input }: { courierId: string; input: UpdateCourierConnectionInput }) =>
      couriersApi.updateConnection(shopId!, courierId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.couriers(shopId),
      });
    },
  });
}

export function useDeleteCourier() {
  const { shopId } = useCurrentShop();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courierId: string) =>
      couriersApi.deleteConnection(shopId!, courierId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.couriers(shopId),
      });
    },
  });
}

export function useTestCourier() {
  const { shopId } = useCurrentShop();
  return useMutation({
    mutationFn: (courierId: string) =>
      couriersApi.testConnection(shopId!, courierId),
  });
}

export function useShipments(query: ShipmentListQuery = {}) {
  const { shopId } = useCurrentShop();
  return useQuery({
    queryKey: queryKeys.shipments(shopId, query),
    queryFn: () => couriersApi.listShipments(shopId!, query),
    enabled: Boolean(shopId),
  });
}

export function useShipment(shipmentId: string | null | undefined) {
  const { shopId } = useCurrentShop();
  return useQuery({
    queryKey: queryKeys.shipment(shopId, shipmentId),
    queryFn: () => couriersApi.getShipment(shopId!, shipmentId!),
    enabled: Boolean(shopId && shipmentId),
  });
}

export function useBookShipment() {
  const { shopId } = useCurrentShop();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BookShipmentInput) =>
      couriersApi.bookShipment(shopId!, input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.shipments(shopId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.orders(shopId!),
      });
      void queryClient.invalidateQueries({
        queryKey: ["orders", shopId, "detail", variables.orderId],
      });
    },
  });
}

export function useBulkBookShipments() {
  const { shopId } = useCurrentShop();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: BulkBookShipmentInput) =>
      couriersApi.bulkBook(shopId!, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.shipments(shopId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.orders(shopId!),
      });
    },
  });
}

export function useManualShipment() {
  const { shopId } = useCurrentShop();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ManualShipmentInput) =>
      couriersApi.manualShipment(shopId!, input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.shipments(shopId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.orders(shopId!),
      });
      void queryClient.invalidateQueries({
        queryKey: ["orders", shopId, "detail", variables.orderId],
      });
    },
  });
}

export function useUpdateManualStatus() {
  const { shopId } = useCurrentShop();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shipmentId, input }: { shipmentId: string; input: UpdateManualStatusInput }) =>
      couriersApi.updateManualStatus(shopId!, shipmentId, input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.shipments(shopId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.shipment(shopId, variables.shipmentId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.orders(shopId!),
      });
    },
  });
}

export function useSyncShipment() {
  const { shopId } = useCurrentShop();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shipmentId: string) =>
      couriersApi.syncShipment(shopId!, shipmentId),
    onSuccess: (_data, shipmentId) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.shipments(shopId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.shipment(shopId, shipmentId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.orders(shopId!),
      });
    },
  });
}

export function useCancelShipment() {
  const { shopId } = useCurrentShop();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shipmentId, input }: { shipmentId: string; input?: CancelShipmentInput }) =>
      couriersApi.cancelShipment(shopId!, shipmentId, input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.shipments(shopId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.shipment(shopId, variables.shipmentId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.orders(shopId!),
      });
    },
  });
}

import { ordersApi } from './api';
import { Order, CreateOrderRequest } from '../types';

export const ordersService = {
  // POST /api/orders
  createOrder: async (order: CreateOrderRequest): Promise<Order> => {
    const response = await ordersApi.post<Order>('', order);   // ✅ /api/orders
    return response.data;
  },

  // GET /api/orders/:id
  getOrder: async (orderId: string | number): Promise<Order> => {
    const response = await ordersApi.get<Order>(`/${orderId}`);
    return response.data;
  },

  // GET /api/orders
  getAllOrders: async (): Promise<Order[]> => {
    const response = await ordersApi.get<Order[]>('');
    return response.data;
  },

  // Get orders for a user (frontend filter for now)
    getUserOrders: async (userId: string | number): Promise<Order[]> => {
      const response = await ordersApi.get<Order[]>(`/user/${userId}`);
      return response.data;
    },

  // PATCH /api/orders/:id/status
  updateOrderStatus: async (
    orderId: string | number,
    updates: any
  ): Promise<Order> => {
    const response = await ordersApi.patch<Order>(`/${orderId}/status`, updates);
    return response.data;
  },
};
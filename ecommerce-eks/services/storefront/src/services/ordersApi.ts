import { ordersApi } from './api';
import { Order, CreateOrderRequest } from '../types';

export const ordersService = {
  // Create a new order
  createOrder: async (orderData: CreateOrderRequest): Promise<Order> => {
    const response = await ordersApi.post<Order>('/api/orders', orderData);
    return response.data;
  },

  // Get order by ID
  getOrder: async (orderId: number): Promise<Order> => {
    const response = await ordersApi.get<Order>(`/api/orders/${orderId}`);
    return response.data;
  },

  // Get all orders for current user
  getUserOrders: async (userId: number): Promise<Order[]> => {
    // Note: This endpoint might not exist in the backend, we may need to implement filtering client-side
    // For now, we'll return an empty array or implement once the backend supports it
    try {
      const response = await ordersApi.get<Order[]>(`/api/orders/user/${userId}`);
      return response.data;
    } catch (error) {
      console.warn('User orders endpoint not available:', error);
      return [];
    }
  },
};
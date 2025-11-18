import { inventoryApi } from './api';
import { InventoryItem } from '../types';

export const inventoryService = {
  // Get inventory for a product
  getInventory: async (productId: string): Promise<InventoryItem> => {
    const response = await inventoryApi.get<InventoryItem>(`/api/inventory/${productId}`);
    return response.data;
  },

  // Update inventory quantity
  updateInventory: async (productId: string, quantity: number): Promise<InventoryItem> => {
    const response = await inventoryApi.put<InventoryItem>(
      `/api/inventory/${productId}`,
      { quantity }
    );
    return response.data;
  },

  // Check if product is in stock
  checkStock: async (productId: string, requiredQuantity: number): Promise<boolean> => {
    const inventory = await inventoryService.getInventory(productId);
    return inventory.quantity >= requiredQuantity;
  },
};
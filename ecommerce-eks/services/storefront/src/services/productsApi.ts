import { productsApi } from './api';
import { Product, CreateProductRequest, UpdateProductRequest } from '../types';

// GET /api/products
export function getProducts() {
  return productsApi.get('');  // -> /api/products
}

export const productsService = {
  getAllProducts: async (): Promise<Product[]> => {
    const response = await productsApi.get<Product[]>('');
    return response.data;
  },

  getProduct: async (productId: string): Promise<Product> => {
    const response = await productsApi.get<Product>(`/${productId}`);
    return response.data;
  },

  createProduct: async (product: CreateProductRequest): Promise<Product> => {
    const response = await productsApi.post<Product>('', product);
    return response.data;
  },

  updateProduct: async (productId: string, updates: UpdateProductRequest): Promise<Product> => {
    const response = await productsApi.patch<Product>(`/${productId}`, updates);
    return response.data;
  },

  deleteProduct: async (productId: string): Promise<void> => {
    await productsApi.delete(`/${productId}`);
  },
};
import { productsApi } from './api';
import { Product, CreateProductRequest, UpdateProductRequest } from '../types';

// Optional legacy helper
export function getProducts() {
  // GET /products/api/products
  return productsApi.get<Product[]>('');
}

export const productsService = {
  // GET /products/api/products
  getAllProducts: async (): Promise<Product[]> => {
    const response = await productsApi.get<Product[]>('');
    return response.data;
  },

  // GET /products/api/products/{id}
  getProduct: async (productId: string): Promise<Product> => {
    const response = await productsApi.get<Product>(`/${productId}`);
    return response.data;
  },

  // POST /products/api/products
  createProduct: async (product: CreateProductRequest): Promise<Product> => {
    const response = await productsApi.post<Product>('', product);
    return response.data;
  },

  // PATCH /products/api/products/{id}
  updateProduct: async (productId: string, updates: UpdateProductRequest): Promise<Product> => {
    const response = await productsApi.patch<Product>(`/${productId}`, updates);
    return response.data;
  },

  // DELETE /products/api/products/{id}
  deleteProduct: async (productId: string): Promise<void> => {
    await productsApi.delete(`/${productId}`);
  },
};
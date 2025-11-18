import { productsApi } from './api';
import { Product, CreateProductRequest, UpdateProductRequest } from '../types';

export const productsService = {
  // Get all products
  getAllProducts: async (): Promise<Product[]> => {
    const response = await productsApi.get<Product[]>('/api/products');
    return response.data;
  },

  // Get single product by ID
  getProduct: async (productId: string): Promise<Product> => {
    const response = await productsApi.get<Product>(`/api/products/${productId}`);
    return response.data;
  },

  // Create new product
  createProduct: async (product: CreateProductRequest): Promise<Product> => {
    const response = await productsApi.post<Product>('/api/products', product);
    return response.data;
  },

  // Update product
  updateProduct: async (productId: string, updates: UpdateProductRequest): Promise<Product> => {
    const response = await productsApi.patch<Product>(`/api/products/${productId}`, updates);
    return response.data;
  },

  // Delete product
  deleteProduct: async (productId: string): Promise<void> => {
    await productsApi.delete(`/api/products/${productId}`);
  },

  // Get products by category
  getProductsByCategory: async (category: string): Promise<Product[]> => {
    const allProducts = await productsService.getAllProducts();
    return allProducts.filter(p => p.category === category);
  },
};
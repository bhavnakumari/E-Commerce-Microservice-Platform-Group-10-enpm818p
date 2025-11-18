// User Types
export interface User {
  id: number;
  email: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  email: string;
  token: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  imageUrl?: string;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  imageUrl?: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  imageUrl?: string;
}

// Inventory Types
export interface InventoryItem {
  productId: string;
  quantity: number;
}

export interface UpdateInventoryRequest {
  quantity: number;
}

// Payment Types
export interface PaymentRequest {
  userId: number;
  amount: number;
  currency: string;
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
}

export interface PaymentResponse {
  status: 'APPROVED' | 'DECLINED';
  transactionId: string;
  reason: string;
}

// Order Types
export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface OrderItemWithDetails extends OrderItem {
  product?: Product;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderPayment {
  amount: number;
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  currency: string;
}

export interface CreateOrderRequest {
  userId: number;
  items: OrderItem[];
  payment: OrderPayment;
}

export interface Order {
  id: number;
  userId: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
}
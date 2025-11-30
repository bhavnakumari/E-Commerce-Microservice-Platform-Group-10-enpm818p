import axios from 'axios';

// Base API URLs for each microservice
export const API_URLS = {
  USERS: '/api/users',
  PRODUCTS: '/api/products',
  INVENTORY: '/api/inventory',
  ORDERS: '/api/orders',
  PAYMENTS: '/api/payments',
};

// Create axios instances for each service
export const usersApi = axios.create({
  baseURL: API_URLS.USERS,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productsApi = axios.create({
  baseURL: API_URLS.PRODUCTS,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const inventoryApi = axios.create({
  baseURL: API_URLS.INVENTORY,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ordersApi = axios.create({
  baseURL: API_URLS.ORDERS,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const paymentsApi = axios.create({
  baseURL: API_URLS.PAYMENTS,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
const addAuthInterceptor = (apiInstance: typeof usersApi) => {
  apiInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

// Apply auth interceptor to all APIs
addAuthInterceptor(usersApi);
addAuthInterceptor(productsApi);
addAuthInterceptor(inventoryApi);
addAuthInterceptor(ordersApi);
addAuthInterceptor(paymentsApi);

ordersApi.interceptors.request.use((config) => {
  console.log('ORDERS REQUEST:', {
    baseURL: config.baseURL,
    url: config.url,
    full: (config.baseURL || '') + (config.url || ''),
  });
  return config;
});
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';
import { Product } from '../types';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const mockProduct1: Product = {
  id: '1',
  name: 'Product 1',
  sku: 'SKU-001',
  description: 'Test product 1',
  price: 10.0,
  stock: 100,
  category: 'test',
};

const mockProduct2: Product = {
  id: '2',
  name: 'Product 2',
  sku: 'SKU-002',
  description: 'Test product 2',
  price: 20.0,
  stock: 50,
  category: 'test',
};

describe('CartContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('Initialization', () => {
    test('initializes with empty cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      expect(result.current.cart).toEqual([]);
      expect(result.current.getTotalItems()).toBe(0);
      expect(result.current.getTotalPrice()).toBe(0);
    });

    test('loads cart from localStorage on mount', () => {
      const savedCart = [{ product: mockProduct1, quantity: 2 }];
      localStorageMock.setItem('cart', JSON.stringify(savedCart));

      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      expect(result.current.cart).toEqual(savedCart);
      expect(result.current.getTotalItems()).toBe(2);
    });

    test('handles invalid localStorage data gracefully', () => {
      localStorageMock.setItem('cart', 'invalid json');

      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      // Should initialize with empty cart if localStorage data is invalid
      expect(result.current.cart).toEqual([]);
    });
  });

  describe('addToCart', () => {
    test('adds new product to cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct1, 1);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].product).toEqual(mockProduct1);
      expect(result.current.cart[0].quantity).toBe(1);
    });

    test('adds product with default quantity of 1 when quantity not specified', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct1);
      });

      expect(result.current.cart[0].quantity).toBe(1);
    });

    test('increments quantity when adding existing product', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct1, 2);
      });

      act(() => {
        result.current.addToCart(mockProduct1, 3);
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].quantity).toBe(5);
    });

    test('adds multiple different products', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct1, 1);
        result.current.addToCart(mockProduct2, 2);
      });

      expect(result.current.cart).toHaveLength(2);
      expect(result.current.getTotalItems()).toBe(3);
    });

    test('saves cart to localStorage after adding', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct1, 1);
      });

      const savedCart = JSON.parse(localStorageMock.getItem('cart')!);
      expect(savedCart).toHaveLength(1);
      expect(savedCart[0].product.id).toBe('1');
    });
  });

  describe('removeFromCart', () => {
    test('removes product from cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct1, 1);
        result.current.addToCart(mockProduct2, 2);
      });

      act(() => {
        result.current.removeFromCart('1');
      });

      expect(result.current.cart).toHaveLength(1);
      expect(result.current.cart[0].product.id).toBe('2');
    });

    test('does nothing when removing non-existent product', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct1, 1);
      });

      act(() => {
        result.current.removeFromCart('999');
      });

      expect(result.current.cart).toHaveLength(1);
    });

    test('updates localStorage after removal', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct1, 1);
        result.current.addToCart(mockProduct2, 1);
      });

      act(() => {
        result.current.removeFromCart('1');
      });

      const savedCart = JSON.parse(localStorageMock.getItem('cart')!);
      expect(savedCart).toHaveLength(1);
      expect(savedCart[0].product.id).toBe('2');
    });
  });

  describe('updateQuantity', () => {
    test('updates product quantity', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct1, 2);
      });

      act(() => {
        result.current.updateQuantity('1', 5);
      });

      expect(result.current.cart[0].quantity).toBe(5);
    });

    test('removes product when quantity set to 0', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct1, 2);
      });

      act(() => {
        result.current.updateQuantity('1', 0);
      });

      expect(result.current.cart).toHaveLength(0);
    });

    test('removes product when quantity set to negative', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct1, 2);
      });

      act(() => {
        result.current.updateQuantity('1', -1);
      });

      expect(result.current.cart).toHaveLength(0);
    });

    test('does not affect other products when updating quantity', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct1, 2);
        result.current.addToCart(mockProduct2, 3);
      });

      act(() => {
        result.current.updateQuantity('1', 5);
      });

      expect(result.current.cart[0].quantity).toBe(5);
      expect(result.current.cart[1].quantity).toBe(3);
    });

    test('updates localStorage after quantity change', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct1, 2);
      });

      act(() => {
        result.current.updateQuantity('1', 10);
      });

      const savedCart = JSON.parse(localStorageMock.getItem('cart')!);
      expect(savedCart[0].quantity).toBe(10);
    });
  });

  describe('clearCart', () => {
    test('removes all products from cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct1, 2);
        result.current.addToCart(mockProduct2, 3);
      });

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.cart).toHaveLength(0);
      expect(result.current.getTotalItems()).toBe(0);
      expect(result.current.getTotalPrice()).toBe(0);
    });

    test('clears localStorage', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct1, 2);
      });

      act(() => {
        result.current.clearCart();
      });

      const savedCart = JSON.parse(localStorageMock.getItem('cart')!);
      expect(savedCart).toHaveLength(0);
    });
  });

  describe('getTotalItems', () => {
    test('returns 0 for empty cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      expect(result.current.getTotalItems()).toBe(0);
    });

    test('calculates total items correctly', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct1, 2);
        result.current.addToCart(mockProduct2, 3);
      });

      expect(result.current.getTotalItems()).toBe(5);
    });

    test('updates total items after quantity change', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct1, 2);
      });

      expect(result.current.getTotalItems()).toBe(2);

      act(() => {
        result.current.updateQuantity('1', 10);
      });

      expect(result.current.getTotalItems()).toBe(10);
    });
  });

  describe('getTotalPrice', () => {
    test('returns 0 for empty cart', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      expect(result.current.getTotalPrice()).toBe(0);
    });

    test('calculates total price correctly', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct1, 2); // 2 * 10 = 20
        result.current.addToCart(mockProduct2, 3); // 3 * 20 = 60
      });

      expect(result.current.getTotalPrice()).toBe(80);
    });

    test('updates total price after quantity change', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct1, 2); // 2 * 10 = 20
      });

      expect(result.current.getTotalPrice()).toBe(20);

      act(() => {
        result.current.updateQuantity('1', 5); // 5 * 10 = 50
      });

      expect(result.current.getTotalPrice()).toBe(50);
    });

    test('updates total price after product removal', () => {
      const { result } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct1, 2); // 20
        result.current.addToCart(mockProduct2, 1); // 20
      });

      expect(result.current.getTotalPrice()).toBe(40);

      act(() => {
        result.current.removeFromCart('1');
      });

      expect(result.current.getTotalPrice()).toBe(20);
    });
  });

  describe('Error Handling', () => {
    test('throws error when useCart is used outside CartProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useCart());
      }).toThrow('useCart must be used within a CartProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('LocalStorage Persistence', () => {
    test('persists cart across multiple renders', () => {
      const { result, unmount } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      act(() => {
        result.current.addToCart(mockProduct1, 3);
      });

      unmount();

      const { result: newResult } = renderHook(() => useCart(), {
        wrapper: CartProvider,
      });

      expect(newResult.current.cart).toHaveLength(1);
      expect(newResult.current.cart[0].quantity).toBe(3);
    });
  });
});

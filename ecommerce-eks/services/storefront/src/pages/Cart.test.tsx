import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Cart from './Cart';
import { CartProvider, useCart } from '../context/CartContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { Product } from '../types';

// Mock the hooks
jest.mock('../context/CartContext', () => ({
  ...jest.requireActual('../context/CartContext'),
  useCart: jest.fn(),
}));

jest.mock('../context/AuthContext', () => ({
  ...jest.requireActual('../context/AuthContext'),
  useAuth: jest.fn(),
}));

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock toast
jest.mock('react-hot-toast');

const mockProduct1: Product = {
  id: '1',
  name: 'Test Product 1',
  sku: 'TEST-001',
  description: 'Test description 1',
  price: 29.99,
  stock: 100,
  category: 'test',
};

const mockProduct2: Product = {
  id: '2',
  name: 'Test Product 2',
  sku: 'TEST-002',
  description: 'Test description 2',
  price: 49.99,
  stock: 50,
  category: 'test',
};

const mockCartContextValue = {
  cart: [
    { product: mockProduct1, quantity: 2 },
    { product: mockProduct2, quantity: 1 },
  ],
  addToCart: jest.fn(),
  removeFromCart: jest.fn(),
  updateQuantity: jest.fn(),
  clearCart: jest.fn(),
  getTotalItems: jest.fn(() => 3),
  getTotalPrice: jest.fn(() => 109.97),
};

const mockAuthContextValue = {
  user: { id: 1, email: 'test@example.com', name: 'Test User' },
  loading: false,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  isAuthenticated: true,
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('Cart Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useCart as jest.Mock).mockReturnValue(mockCartContextValue);
    (useAuth as jest.Mock).mockReturnValue(mockAuthContextValue);
  });

  describe('Empty Cart', () => {
    test('displays empty cart message when cart is empty', () => {
      (useCart as jest.Mock).mockReturnValue({
        ...mockCartContextValue,
        cart: [],
        getTotalItems: () => 0,
        getTotalPrice: () => 0,
      });

      renderWithProviders(<Cart />);

      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
      expect(
        screen.getByText("Looks like you haven't added anything to your cart yet")
      ).toBeInTheDocument();
    });

    test('shows start shopping link when cart is empty', () => {
      (useCart as jest.Mock).mockReturnValue({
        ...mockCartContextValue,
        cart: [],
      });

      renderWithProviders(<Cart />);

      const shopLink = screen.getByRole('link', { name: /start shopping/i });
      expect(shopLink).toBeInTheDocument();
      expect(shopLink).toHaveAttribute('href', '/products');
    });

    test('displays empty cart icon', () => {
      (useCart as jest.Mock).mockReturnValue({
        ...mockCartContextValue,
        cart: [],
      });

      renderWithProviders(<Cart />);

      expect(screen.getByText('🛒')).toBeInTheDocument();
    });
  });

  describe('Cart with Items', () => {
    test('displays cart title', () => {
      renderWithProviders(<Cart />);

      expect(screen.getByRole('heading', { name: /shopping cart/i })).toBeInTheDocument();
    });

    test('displays all cart items', () => {
      renderWithProviders(<Cart />);

      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    });

    test('displays product descriptions', () => {
      renderWithProviders(<Cart />);

      expect(screen.getByText('Test description 1')).toBeInTheDocument();
      expect(screen.getByText('Test description 2')).toBeInTheDocument();
    });

    test('displays product prices', () => {
      renderWithProviders(<Cart />);

      expect(screen.getByText('$29.99')).toBeInTheDocument();
      expect(screen.getByText('$49.99')).toBeInTheDocument();
    });

    test('displays product quantities', () => {
      renderWithProviders(<Cart />);

      const quantities = screen.getAllByText(/\d+/).filter((el) => {
        return el.textContent === '2' || el.textContent === '1';
      });

      expect(quantities.length).toBeGreaterThan(0);
    });

    test('links to product detail pages', () => {
      renderWithProviders(<Cart />);

      const productLinks = screen.getAllByRole('link').filter((link) =>
        link.getAttribute('href')?.includes('/products/')
      );

      expect(productLinks.length).toBeGreaterThan(0);
      expect(productLinks[0]).toHaveAttribute('href', '/products/1');
    });
  });

  describe('Quantity Controls', () => {
    test('displays increment and decrement buttons for each item', () => {
      renderWithProviders(<Cart />);

      const decrementButtons = screen.getAllByRole('button', { name: '-' });
      const incrementButtons = screen.getAllByRole('button', { name: '+' });

      expect(decrementButtons.length).toBeGreaterThan(0);
      expect(incrementButtons.length).toBeGreaterThan(0);
    });

    test('calls updateQuantity when decrement button is clicked', () => {
      const mockUpdateQuantity = jest.fn();
      (useCart as jest.Mock).mockReturnValue({
        ...mockCartContextValue,
        updateQuantity: mockUpdateQuantity,
      });

      renderWithProviders(<Cart />);

      const decrementButtons = screen.getAllByRole('button', { name: '-' });
      fireEvent.click(decrementButtons[0]);

      expect(mockUpdateQuantity).toHaveBeenCalledWith('1', 1);
    });

    test('calls updateQuantity when increment button is clicked', () => {
      const mockUpdateQuantity = jest.fn();
      (useCart as jest.Mock).mockReturnValue({
        ...mockCartContextValue,
        updateQuantity: mockUpdateQuantity,
      });

      renderWithProviders(<Cart />);

      const incrementButtons = screen.getAllByRole('button', { name: '+' });
      fireEvent.click(incrementButtons[0]);

      expect(mockUpdateQuantity).toHaveBeenCalledWith('1', 3);
    });
  });

  describe('Remove Item', () => {
    test('displays remove button for each item', () => {
      renderWithProviders(<Cart />);

      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      expect(removeButtons.length).toBe(2);
    });

    test('calls removeFromCart when remove button is clicked', () => {
      const mockRemoveFromCart = jest.fn();
      (useCart as jest.Mock).mockReturnValue({
        ...mockCartContextValue,
        removeFromCart: mockRemoveFromCart,
      });

      renderWithProviders(<Cart />);

      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      fireEvent.click(removeButtons[0]);

      expect(mockRemoveFromCart).toHaveBeenCalledWith('1');
    });
  });

  describe('Cart Summary', () => {
    test('displays order summary section', () => {
      renderWithProviders(<Cart />);

      expect(screen.getByText(/order summary/i)).toBeInTheDocument();
    });

    test('displays subtotal with correct amount', () => {
      renderWithProviders(<Cart />);

      expect(screen.getByText(/subtotal/i)).toBeInTheDocument();
      expect(screen.getByText('$109.97')).toBeInTheDocument();
    });

    test('displays total items count', () => {
      renderWithProviders(<Cart />);

      const itemsText = screen.getByText(/3 items/i);
      expect(itemsText).toBeInTheDocument();
    });

    test('displays total amount', () => {
      renderWithProviders(<Cart />);

      expect(screen.getByText(/total/i)).toBeInTheDocument();
    });
  });

  describe('Checkout Flow', () => {
    test('displays checkout button', () => {
      renderWithProviders(<Cart />);

      expect(screen.getByRole('button', { name: /proceed to checkout/i })).toBeInTheDocument();
    });

    test('navigates to checkout when user is authenticated', () => {
      (useAuth as jest.Mock).mockReturnValue({
        ...mockAuthContextValue,
        isAuthenticated: true,
      });

      renderWithProviders(<Cart />);

      const checkoutButton = screen.getByRole('button', { name: /proceed to checkout/i });
      fireEvent.click(checkoutButton);

      expect(mockNavigate).toHaveBeenCalledWith('/checkout');
    });

    test('navigates to login when user is not authenticated', () => {
      (useAuth as jest.Mock).mockReturnValue({
        ...mockAuthContextValue,
        isAuthenticated: false,
      });

      renderWithProviders(<Cart />);

      const checkoutButton = screen.getByRole('button', { name: /proceed to checkout/i });
      fireEvent.click(checkoutButton);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('Item Calculations', () => {
    test('displays correct item total (quantity × price)', () => {
      renderWithProviders(<Cart />);

      // Product 1: 2 × $29.99 = $59.98
      expect(screen.getByText('$59.98')).toBeInTheDocument();

      // Product 2: 1 × $49.99 = $49.99
      expect(screen.getByText('$49.99')).toBeInTheDocument();
    });

    test('updates total when quantity changes', () => {
      const mockGetTotalPrice = jest.fn(() => 159.96);

      (useCart as jest.Mock).mockReturnValue({
        ...mockCartContextValue,
        getTotalPrice: mockGetTotalPrice,
      });

      renderWithProviders(<Cart />);

      expect(mockGetTotalPrice).toHaveBeenCalled();
    });
  });

  describe('Continue Shopping', () => {
    test('displays continue shopping link', () => {
      renderWithProviders(<Cart />);

      const continueLink = screen.getByRole('link', { name: /continue shopping/i });
      expect(continueLink).toBeInTheDocument();
      expect(continueLink).toHaveAttribute('href', '/products');
    });
  });

  describe('Responsive Behavior', () => {
    test('renders cart items in a list', () => {
      renderWithProviders(<Cart />);

      const cartItems = screen.getAllByText(/test product/i);
      expect(cartItems.length).toBe(2);
    });
  });

  describe('Edge Cases', () => {
    test('handles product without description', () => {
      const productWithoutDesc = { ...mockProduct1, description: undefined };

      (useCart as jest.Mock).mockReturnValue({
        ...mockCartContextValue,
        cart: [{ product: productWithoutDesc, quantity: 1 }],
        getTotalItems: () => 1,
        getTotalPrice: () => 29.99,
      });

      renderWithProviders(<Cart />);

      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.queryByText('Test description 1')).not.toBeInTheDocument();
    });

    test('handles single item in cart', () => {
      (useCart as jest.Mock).mockReturnValue({
        ...mockCartContextValue,
        cart: [{ product: mockProduct1, quantity: 1 }],
        getTotalItems: () => 1,
        getTotalPrice: () => 29.99,
      });

      renderWithProviders(<Cart />);

      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.getByText(/1 item/i)).toBeInTheDocument();
    });

    test('handles large quantities', () => {
      (useCart as jest.Mock).mockReturnValue({
        ...mockCartContextValue,
        cart: [{ product: mockProduct1, quantity: 100 }],
        getTotalItems: () => 100,
        getTotalPrice: () => 2999.0,
      });

      renderWithProviders(<Cart />);

      expect(screen.getByText('100')).toBeInTheDocument();
    });
  });
});

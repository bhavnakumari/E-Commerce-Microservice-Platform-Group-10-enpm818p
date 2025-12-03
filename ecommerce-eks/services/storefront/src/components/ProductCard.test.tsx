import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductCard from './ProductCard';
import { CartProvider } from '../context/CartContext';
import { Product } from '../types';
import toast from 'react-hot-toast';

// Mock react-hot-toast
jest.mock('react-hot-toast');

const mockProduct: Product = {
  id: '1',
  name: 'Test Product',
  sku: 'TEST-001',
  description: 'Test product description',
  price: 29.99,
  stock: 10,
  category: 'electronics',
  imageUrl: 'https://example.com/test.jpg'
};

const mockOutOfStockProduct: Product = {
  ...mockProduct,
  id: '2',
  stock: 0
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <CartProvider>
        {component}
      </CartProvider>
    </BrowserRouter>
  );
};

describe('ProductCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders product information correctly', () => {
      renderWithProviders(<ProductCard product={mockProduct} />);

      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('Test product description')).toBeInTheDocument();
      expect(screen.getByText('$29.99')).toBeInTheDocument();
      expect(screen.getByText('10 Available')).toBeInTheDocument();
      expect(screen.getByText('electronics')).toBeInTheDocument();
    });

    test('renders product image with correct src', () => {
      renderWithProviders(<ProductCard product={mockProduct} />);

      const image = screen.getByAltText('Test Product') as HTMLImageElement;
      expect(image).toBeInTheDocument();
      expect(image.src).toBe('https://example.com/test.jpg');
    });

    test('renders fallback icon when imageUrl is not provided', () => {
      const productWithoutImage = { ...mockProduct, imageUrl: undefined };
      renderWithProviders(<ProductCard product={productWithoutImage} />);

      expect(screen.queryByAltText('Test Product')).not.toBeInTheDocument();
      expect(screen.getByText('📦')).toBeInTheDocument();
    });

    test('shows low stock badge when stock is below 20', () => {
      const lowStockProduct = { ...mockProduct, stock: 5 };
      renderWithProviders(<ProductCard product={lowStockProduct} />);

      expect(screen.getByText('Only 5 left!')).toBeInTheDocument();
    });

    test('does not show low stock badge when stock is 20 or more', () => {
      const goodStockProduct = { ...mockProduct, stock: 20 };
      renderWithProviders(<ProductCard product={goodStockProduct} />);

      expect(screen.queryByText(/Only.*left!/)).not.toBeInTheDocument();
    });
  });

  describe('Out of Stock Handling', () => {
    test('displays out of stock overlay when stock is 0', () => {
      renderWithProviders(<ProductCard product={mockOutOfStockProduct} />);

      expect(screen.getByText('Out of Stock')).toBeInTheDocument();
      expect(screen.getByText('Out of stock')).toBeInTheDocument();
    });

    test('disables add to cart button when out of stock', () => {
      renderWithProviders(<ProductCard product={mockOutOfStockProduct} />);

      const outOfStockButton = screen.getByRole('button', { name: /out of stock/i });
      expect(outOfStockButton).toBeDisabled();
    });

    test('does not show add to cart button when out of stock', () => {
      renderWithProviders(<ProductCard product={mockOutOfStockProduct} />);

      expect(screen.queryByText('Add to Cart')).not.toBeInTheDocument();
    });
  });

  describe('Add to Cart Functionality', () => {
    test('shows add to cart button when product is in stock', () => {
      renderWithProviders(<ProductCard product={mockProduct} />);

      const addButton = screen.getByRole('button', { name: /add to cart/i });
      expect(addButton).toBeInTheDocument();
      expect(addButton).not.toBeDisabled();
    });

    test('adds product to cart when add to cart button is clicked', async () => {
      renderWithProviders(<ProductCard product={mockProduct} />);

      const addButton = screen.getByRole('button', { name: /add to cart/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    });

    test('shows loading state when adding to cart', async () => {
      renderWithProviders(<ProductCard product={mockProduct} />);

      const addButton = screen.getByRole('button', { name: /add to cart/i });
      fireEvent.click(addButton);

      expect(screen.getByText('Adding to cart...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Adding to cart...')).not.toBeInTheDocument();
      });
    });

    test('disables button while adding to cart', async () => {
      renderWithProviders(<ProductCard product={mockProduct} />);

      const addButton = screen.getByRole('button', { name: /add to cart/i });
      fireEvent.click(addButton);

      expect(addButton).toBeDisabled();

      await waitFor(() => {
        expect(addButton).not.toBeDisabled();
      });
    });

    test('displays success toast with product name after adding to cart', async () => {
      renderWithProviders(<ProductCard product={mockProduct} />);

      const addButton = screen.getByRole('button', { name: /add to cart/i });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ duration: 2000 })
        );
      });
    });
  });

  describe('Navigation', () => {
    test('product card links to product detail page', () => {
      renderWithProviders(<ProductCard product={mockProduct} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/products/1');
    });

    test('clicking product card does not trigger add to cart', () => {
      renderWithProviders(<ProductCard product={mockProduct} />);

      const link = screen.getByRole('link');
      fireEvent.click(link);

      expect(toast.success).not.toHaveBeenCalled();
    });
  });

  describe('Price Display', () => {
    test('formats price with two decimal places', () => {
      renderWithProviders(<ProductCard product={mockProduct} />);

      expect(screen.getByText('$29.99')).toBeInTheDocument();
    });

    test('displays whole number prices correctly', () => {
      const wholeNumberProduct = { ...mockProduct, price: 30 };
      renderWithProviders(<ProductCard product={wholeNumberProduct} />);

      expect(screen.getByText('$30.00')).toBeInTheDocument();
    });
  });

  describe('Category Display', () => {
    test('displays category badge when category is provided', () => {
      renderWithProviders(<ProductCard product={mockProduct} />);

      expect(screen.getByText('electronics')).toBeInTheDocument();
    });

    test('does not display category badge when category is not provided', () => {
      const productWithoutCategory = { ...mockProduct, category: undefined };
      renderWithProviders(<ProductCard product={productWithoutCategory} />);

      expect(screen.queryByText('electronics')).not.toBeInTheDocument();
    });
  });

  describe('Description Display', () => {
    test('displays description when provided', () => {
      renderWithProviders(<ProductCard product={mockProduct} />);

      expect(screen.getByText('Test product description')).toBeInTheDocument();
    });

    test('does not display description when not provided', () => {
      const productWithoutDesc = { ...mockProduct, description: undefined };
      renderWithProviders(<ProductCard product={productWithoutDesc} />);

      expect(screen.queryByText('Test product description')).not.toBeInTheDocument();
    });
  });

  describe('Image Error Handling', () => {
    test('shows fallback icon when image fails to load', () => {
      renderWithProviders(<ProductCard product={mockProduct} />);

      const image = screen.getByAltText('Test Product') as HTMLImageElement;
      fireEvent.error(image);

      // After error, fallback should be visible
      const fallbackIcons = screen.getAllByText('📦');
      expect(fallbackIcons.length).toBeGreaterThan(0);
    });
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import Login from './Login';
import { AuthProvider } from '../context/AuthContext';
import { usersService } from '../services/usersApi';

// Mock the usersService
jest.mock('../services/usersApi', () => ({
  usersService: {
    login: jest.fn(),
    getUser: jest.fn(),
    isAuthenticated: jest.fn(),
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <AuthProvider>{component}</AuthProvider>
    </MemoryRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usersService.isAuthenticated as jest.Mock).mockReturnValue(false);
  });

  describe('Rendering', () => {
    test('renders login form with all elements', async () => {
      renderWithProviders(<Login />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /log in to shop/i })).toBeInTheDocument();
      });

      expect(screen.getByText('Continue your shopping experience')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    test('renders back button', async () => {
      renderWithProviders(<Login />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
      });
    });

    test('renders link to register page', async () => {
      renderWithProviders(<Login />);

      await waitFor(() => {
        expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
      });

      const registerLink = screen.getByRole('link', { name: /sign up/i });
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute('href', '/register');
    });
  });

  describe('Form Input', () => {
    test('allows user to type email', async () => {
      renderWithProviders(<Login />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByPlaceholderText(/email/i) as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(emailInput.value).toBe('test@example.com');
    });

    test('allows user to type password', async () => {
      renderWithProviders(<Login />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
      });

      const passwordInput = screen.getByPlaceholderText(/password/i) as HTMLInputElement;
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(passwordInput.value).toBe('password123');
    });

    test('password input type is password', async () => {
      renderWithProviders(<Login />);

      await waitFor(() => {
        const passwordInput = screen.getByPlaceholderText(/password/i);
        expect(passwordInput).toHaveAttribute('type', 'password');
      });
    });

    test('email input type is email', async () => {
      renderWithProviders(<Login />);

      await waitFor(() => {
        const emailInput = screen.getByPlaceholderText(/email/i);
        expect(emailInput).toHaveAttribute('type', 'email');
      });
    });
  });

  describe('Form Submission', () => {
    test('calls login service with correct credentials on submit', async () => {
      (usersService.login as jest.Mock).mockResolvedValue({ userId: 1 });
      (usersService.getUser as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      });

      renderWithProviders(<Login />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(usersService.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    test('navigates to home page on successful login', async () => {
      (usersService.login as jest.Mock).mockResolvedValue({ userId: 1 });
      (usersService.getUser as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'test@example.com',
      });

      renderWithProviders(<Login />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    test('displays loading state during login', async () => {
      (usersService.login as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      renderWithProviders(<Login />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    test('displays error message on login failure', async () => {
      (usersService.login as jest.Mock).mockRejectedValue({
        response: { data: { message: 'Invalid credentials' } },
      });

      renderWithProviders(<Login />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });

    test('displays generic error message when no specific error provided', async () => {
      (usersService.login as jest.Mock).mockRejectedValue(new Error('Network error'));

      renderWithProviders(<Login />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/failed to login\. please check your credentials/i)
        ).toBeInTheDocument();
      });
    });

    test('clears error message on new submission', async () => {
      (usersService.login as jest.Mock)
        .mockRejectedValueOnce({
          response: { data: { message: 'Invalid credentials' } },
        })
        .mockResolvedValueOnce({ userId: 1 });
      (usersService.getUser as jest.Mock).mockResolvedValue({ id: 1 });

      renderWithProviders(<Login />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // First submission - fails
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      // Second submission - succeeds
      fireEvent.change(passwordInput, { target: { value: 'correctpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    test('back button navigates to previous page', async () => {
      renderWithProviders(<Login />);

      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back/i });
        expect(backButton).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /back/i });
      fireEvent.click(backButton);

      // Should call navigate(-1) or navigate('/')
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    test('submit button is enabled with empty fields', async () => {
      renderWithProviders(<Login />);

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /sign in/i });
        expect(submitButton).not.toBeDisabled();
      });
    });

    test('can submit form by pressing enter in email field', async () => {
      (usersService.login as jest.Mock).mockResolvedValue({ userId: 1 });
      (usersService.getUser as jest.Mock).mockResolvedValue({ id: 1 });

      renderWithProviders(<Login />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.submit(emailInput.closest('form')!);

      await waitFor(() => {
        expect(usersService.login).toHaveBeenCalled();
      });
    });
  });
});

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/useAuth';

// Mock useAuth hook
vi.mock('../context/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock Navigate component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }) => <div data-testid="navigate">{`Redirected to ${to}`}</div>,
  };
});

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading spinner when auth is loading', () => {
    useAuth.mockReturnValue({ user: null, loading: true });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    // Check for loading spinner (looking for the animated div)
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    useAuth.mockReturnValue({ user: null, loading: false });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByTestId('navigate')).toHaveTextContent('Redirected to /login');
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render children when user is authenticated', () => {
    const mockUser = { name: 'John Doe', role: 'student' };
    useAuth.mockReturnValue({ user: mockUser, loading: false });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  it('should allow access when user role matches allowedRoles', () => {
    const mockUser = { name: 'John Doe', role: 'student' };
    useAuth.mockReturnValue({ user: mockUser, loading: false });

    render(
      <BrowserRouter>
        <ProtectedRoute allowedRoles={['student', 'entrepreneur']}>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to dashboard when user role does not match allowedRoles', () => {
    const mockUser = { name: 'John Doe', role: 'student' };
    useAuth.mockReturnValue({ user: mockUser, loading: false });

    render(
      <BrowserRouter>
        <ProtectedRoute allowedRoles={['entrepreneur', 'investor']}>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByTestId('navigate')).toHaveTextContent('Redirected to /dashboard');
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should allow access for entrepreneur role when specified in allowedRoles', () => {
    const mockUser = { name: 'Jane Smith', role: 'entrepreneur' };
    useAuth.mockReturnValue({ user: mockUser, loading: false });

    render(
      <BrowserRouter>
        <ProtectedRoute allowedRoles={['entrepreneur']}>
          <div>Entrepreneur Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Entrepreneur Content')).toBeInTheDocument();
  });

  it('should allow access for investor role when specified in allowedRoles', () => {
    const mockUser = { name: 'Bob Johnson', role: 'investor' };
    useAuth.mockReturnValue({ user: mockUser, loading: false });

    render(
      <BrowserRouter>
        <ProtectedRoute allowedRoles={['investor']}>
          <div>Investor Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Investor Content')).toBeInTheDocument();
  });

  it('should render children when no allowedRoles specified and user is authenticated', () => {
    const mockUser = { name: 'Any User', role: 'any-role' };
    useAuth.mockReturnValue({ user: mockUser, loading: false });

    render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Any Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Any Protected Content')).toBeInTheDocument();
  });

  it('should handle loading state correctly', () => {
    useAuth.mockReturnValue({ user: null, loading: true });

    const { rerender } = render(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    // Initially loading
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();

    // Update to loaded with user
    useAuth.mockReturnValue({ 
      user: { name: 'Test User', role: 'student' }, 
      loading: false 
    });

    rerender(
      <BrowserRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </BrowserRouter>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});

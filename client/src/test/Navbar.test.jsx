import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/useAuth';

// Mock useAuth hook
vi.mock('../context/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render navbar with logo', () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('CAMPUS CONNECT')).toBeInTheDocument();
  });

  it('should display Login and Register links when user is not authenticated', () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('should display user name and Dashboard when user is authenticated', () => {
    const mockUser = {
      name: 'John Doe',
      role: 'student',
    };
    useAuth.mockReturnValue({ user: mockUser, logout: vi.fn() });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('student')).toBeInTheDocument();
  });

  it('should display correct role badge for different user roles', () => {
    const roles = ['student', 'entrepreneur', 'investor'];

    roles.forEach((role) => {
      const mockUser = { name: 'Test User', role };
      useAuth.mockReturnValue({ user: mockUser, logout: vi.fn() });

      const { rerender } = render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      expect(screen.getByText(role)).toBeInTheDocument();

      rerender(<></>); // Clean up
    });
  });

  it('should call logout and navigate to login when Logout is clicked', async () => {
    const mockLogout = vi.fn().mockResolvedValue(undefined);
    const mockUser = { name: 'John Doe', role: 'student' };
    useAuth.mockReturnValue({ user: mockUser, logout: mockLogout });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    // Wait for async logout to complete
    await vi.waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('should toggle mobile menu when menu button is clicked', () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    // Mobile menu should not be visible initially
    const mobileLinks = screen.queryAllByRole('link', { name: /home/i });
    expect(mobileLinks.length).toBeGreaterThanOrEqual(1);

    // Find and click menu button
    const menuButtons = screen.getAllByRole('button');
    const menuButton = menuButtons[0]; // First button should be the menu toggle
    
    fireEvent.click(menuButton);
    
    // After clicking, mobile menu should be visible
    expect(screen.getAllByText('Home').length).toBeGreaterThan(1);
  });

  it('should render Home link in navigation', () => {
    useAuth.mockReturnValue({ user: null, logout: vi.fn() });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    const homeLinks = screen.getAllByText('Home');
    expect(homeLinks.length).toBeGreaterThan(0);
  });

  it('should display user info for entrepreneur role', () => {
    const mockUser = {
      name: 'Jane Smith',
      role: 'entrepreneur',
    };
    useAuth.mockReturnValue({ user: mockUser, logout: vi.fn() });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('entrepreneur')).toBeInTheDocument();
  });

  it('should display user info for investor role', () => {
    const mockUser = {
      name: 'Bob Johnson',
      role: 'investor',
    };
    useAuth.mockReturnValue({ user: mockUser, logout: vi.fn() });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.getByText('investor')).toBeInTheDocument();
  });
});

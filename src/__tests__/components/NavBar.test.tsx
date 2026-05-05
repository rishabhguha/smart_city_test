import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn().mockReturnValue({ push: vi.fn() }),
}));

vi.mock('@clerk/nextjs', () => ({
  SignInButton: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignUpButton: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useClerk: () => ({ signOut: vi.fn(), openUserProfile: vi.fn() }),
}));

import { NavBar } from '@/components/NavBar';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('NavBar', () => {
  it('shows Sign In and Sign Up buttons when not signed in', () => {
    render(<NavBar isSignedIn={false} />);
    expect(screen.getByText('Sign In')).toBeTruthy();
    expect(screen.getByText('Sign Up')).toBeTruthy();
  });

  it('shows citizen nav links when role is citizen', async () => {
    server.use(
      http.get('/api/me', () => HttpResponse.json({ id: 'u1', role: 'citizen' }))
    );
    render(<NavBar isSignedIn={true} />);
    await waitFor(() => {
      expect(screen.getByText('Home')).toBeTruthy();
      expect(screen.getByText('Submit Request')).toBeTruthy();
      expect(screen.getByText('My Requests')).toBeTruthy();
    });
  });

  it('hides citizen nav links for admin role', async () => {
    server.use(
      http.get('/api/me', () => HttpResponse.json({ id: 'u1', role: 'admin' }))
    );
    render(<NavBar isSignedIn={true} />);
    await waitFor(() => {
      expect(screen.queryByText('Submit Request')).toBeNull();
      expect(screen.queryByText('My Requests')).toBeNull();
    });
  });

  it('hides citizen nav links for staff role', async () => {
    server.use(
      http.get('/api/me', () => HttpResponse.json({ id: 'u1', role: 'staff' }))
    );
    render(<NavBar isSignedIn={true} />);
    await waitFor(() => {
      expect(screen.queryByText('Submit Request')).toBeNull();
      expect(screen.queryByText('My Requests')).toBeNull();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';

// Stub dynamic import so LocationPicker doesn't pull in mapbox-gl
vi.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => ({ onLocationChange }: { onLocationChange: (lat: number, lng: number, addr: string) => void }) => (
    <button
      type="button"
      data-testid="location-picker"
      onClick={() => onLocationChange(40.71, -74.0, '123 Main St')}
    >
      Set Location
    </button>
  ),
}));

// Replace Base UI Select with a native <select> so tests can use selectOptions
vi.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }: { value: string; onValueChange: (v: string) => void; children: React.ReactNode }) => (
    <select
      data-testid="category-select"
      value={value || ''}
      onChange={(e) => onValueChange(e.target.value)}
    >
      {!value && <option value="" disabled>Select a category...</option>}
      {children}
    </select>
  ),
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}));

vi.mock('@clerk/nextjs', () => ({
  useUser: vi.fn().mockReturnValue({ user: { fullName: 'Jane Doe' } }),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn().mockReturnValue({ push: vi.fn() }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}));

import { RequestForm } from '@/components/forms/RequestForm';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RequestForm', () => {
  it('renders category options fetched from /api/categories', async () => {
    render(<RequestForm />);
    // Wait for MSW to serve categories; the placeholder option is in the DOM until one is selected
    await waitFor(() => {
      expect(screen.getByText(/select a category/i)).toBeTruthy();
    });
  });

  it('shows validation errors when submitting with all fields empty', async () => {
    const user = userEvent.setup();
    render(<RequestForm />);

    // Clear the pre-filled name and submit
    const nameInput = screen.getByLabelText(/your name/i);
    await user.clear(nameInput);
    await user.click(screen.getByRole('button', { name: /submit request/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeTruthy();
      expect(screen.getByText(/please select a category/i)).toBeTruthy();
      expect(screen.getByText(/title is required/i)).toBeTruthy();
      expect(screen.getByText(/description is required/i)).toBeTruthy();
      expect(screen.getByText(/please select a location/i)).toBeTruthy();
    });
  });

  it('disables the submit button while a submission is in flight', async () => {
    const user = userEvent.setup();
    // Make the request hang so we can check loading state
    server.use(
      http.post('/api/requests', () => new Promise(() => {}))
    );

    render(<RequestForm />);
    await waitFor(() => screen.getByRole('button', { name: /submit request/i }));

    // Fill required fields
    await user.type(screen.getByLabelText(/your name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/short title/i), 'Pothole on Main St');
    await user.type(screen.getByLabelText(/description/i), 'Large pothole near the crosswalk');
    // Select a category — wait for MSW to populate options first
    await screen.findByRole('option', { name: /pothole/i });
    await userEvent.selectOptions(screen.getByTestId('category-select'), 'cat_1');
    await user.click(screen.getByTestId('location-picker'));

    await user.click(screen.getByRole('button', { name: /submit request/i }));

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /submitting/i });
      expect(btn).toBeTruthy();
      expect((btn as HTMLButtonElement).disabled).toBe(true);
    });
  });

  it('navigates to /track/{id} after a successful submission', async () => {
    const user = userEvent.setup();
    const { useRouter } = await import('next/navigation');
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as never);

    render(<RequestForm />);
    await waitFor(() => screen.getByLabelText(/your name/i));

    await user.clear(screen.getByLabelText(/your name/i));
    await user.type(screen.getByLabelText(/your name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/short title/i), 'Pothole on Main St');
    await user.type(screen.getByLabelText(/description/i), 'Large pothole near the crosswalk');
    // Select a category — wait for MSW to populate options first
    await screen.findByRole('option', { name: /pothole/i });
    await userEvent.selectOptions(screen.getByTestId('category-select'), 'cat_1');
    await user.click(screen.getByTestId('location-picker'));

    await user.click(screen.getByRole('button', { name: /submit request/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/track/req_new');
    });
  });
});

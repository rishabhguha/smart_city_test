import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { createUser } from '../mocks/factories';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn().mockReturnValue({ push: vi.fn(), refresh: vi.fn() }),
}));

// Suppress sonner in tests
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}));

import { StatusUpdateForm } from '@/app/(staff)/requests/[id]/StatusUpdateForm';

const defaultProps = {
  requestId: 'req_test',
  currentStatus: 'open' as const,
  currentPriority: 'medium',
  currentAssignedTo: '',
  staff: [],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('StatusUpdateForm', () => {
  it('renders the form with status and priority labels', () => {
    render(<StatusUpdateForm {...defaultProps} currentStatus="in_progress" currentPriority="high" />);
    expect(screen.getByText('Update Request')).toBeTruthy();
    expect(screen.getByText('Status')).toBeTruthy();
    expect(screen.getByText('Priority')).toBeTruthy();
    // Base UI Select renders raw enum values in the test environment
    expect(screen.getByText('in_progress')).toBeTruthy();
    expect(screen.getByText('high')).toBeTruthy();
  });

  it('renders staff assignment dropdown when staff list is non-empty', () => {
    const staff = [createUser({ id: 'u1', name: 'Alice Smith' })];
    render(<StatusUpdateForm {...defaultProps} staff={staff} />);
    expect(screen.getByText('Assigned To')).toBeTruthy();
  });

  it('does not render assignment section when staff list is empty', () => {
    render(<StatusUpdateForm {...defaultProps} staff={[]} />);
    expect(screen.queryByText('Assigned To')).toBeNull();
  });

  it('sends a PATCH request and shows a success toast on save', async () => {
    const user = userEvent.setup();
    let patchBody: unknown;

    server.use(
      http.patch('/api/requests/req_test', async ({ request }) => {
        patchBody = await request.json();
        return HttpResponse.json({ id: 'req_test', status: 'open' });
      })
    );

    const { toast } = await import('sonner');
    render(<StatusUpdateForm {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await vi.waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Request updated.');
    });
    expect(patchBody).toMatchObject({ status: 'open', priority: 'medium' });
  });

  it('shows an error toast when the PATCH request fails', async () => {
    const user = userEvent.setup();
    server.use(
      http.patch('/api/requests/req_test', () =>
        HttpResponse.json({ error: 'Server error' }, { status: 500 })
      )
    );

    const { toast } = await import('sonner');
    render(<StatusUpdateForm {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /save changes/i }));

    await vi.waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});

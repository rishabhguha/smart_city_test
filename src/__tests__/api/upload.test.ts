import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@vercel/blob', () => ({
  put: vi.fn().mockResolvedValue({ url: 'https://blob.vercel.app/test.jpg' }),
}));

import { put } from '@vercel/blob';
import { POST } from '@/app/api/upload/route';

const mockPut = vi.mocked(put);

function makeUploadRequest(file: File) {
  const form = new FormData();
  form.append('file', file);
  return new NextRequest('http://localhost/api/upload', {
    method: 'POST',
    body: form,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/upload', () => {
  it('returns 400 when no file is provided', async () => {
    const req = new NextRequest('http://localhost/api/upload', {
      method: 'POST',
      body: new FormData(),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 for non-image file types', async () => {
    const file = new File(['hello'], 'test.txt', { type: 'text/plain' });
    const res = await POST(makeUploadRequest(file));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/image/i);
  });

  it('returns 400 for files exceeding 10 MB', async () => {
    const bigContent = new Uint8Array(11 * 1024 * 1024); // 11 MB
    const file = new File([bigContent], 'big.jpg', { type: 'image/jpeg' });
    const res = await POST(makeUploadRequest(file));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/large/i);
  });

  it('calls put() and returns the blob URL for a valid image', async () => {
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' });
    const res = await POST(makeUploadRequest(file));
    expect(res.status).toBe(200);
    expect(mockPut).toHaveBeenCalledOnce();
    const data = await res.json();
    expect(data.url).toBe('https://blob.vercel.app/test.jpg');
  });
});

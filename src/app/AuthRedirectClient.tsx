'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function AuthRedirectClient() {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/me', { method: 'POST' })
      .then((r) => (r.ok ? r.json() : null))
      .then((user) => {
        if (user?.role === 'admin') router.push('/admin');
        else if (user?.role === 'staff') router.push('/dashboard');
        else router.push('/home');
      })
      .catch(() => router.push('/home'));
  }, [router]);

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='w-6 h-6 rounded-full border-2 border-gray-200 border-t-gray-700 animate-spin' />
    </div>
  );
}

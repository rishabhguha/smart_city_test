'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignInButton, SignUpButton, useClerk } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { BrandMark } from '@/components/BrandMark';
import { useEffect, useRef, useState } from 'react';

interface NavBarProps {
  isSignedIn: boolean;
  userImageUrl?: string;
}

function UserAvatarButton({ imageUrl }: { imageUrl: string }) {
  const { signOut, openUserProfile } = useClerk();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className='relative' ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className='cursor-pointer rounded-full overflow-hidden w-8 h-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          className='w-full h-full object-cover'
          alt='User avatar'
          referrerPolicy='no-referrer'
        />
      </button>
      {open && (
        <div className='absolute right-0 mt-2 w-44 bg-white rounded-md shadow-lg border border-gray-200 z-50 py-1'>
          <button
            onClick={() => {
              openUserProfile();
              setOpen(false);
            }}
            className='cursor-pointer w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
          >
            Manage Account
          </button>
          <button
            onClick={() => signOut()}
            className='cursor-pointer w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export function NavBar({ isSignedIn, userImageUrl }: NavBarProps) {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;
    fetch('/api/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((u) => setRole(u?.role ?? null))
      .catch(() => setRole(null));
  }, [isSignedIn]);

  const isAdmin = isSignedIn && role === 'admin';
  const isStaff = isSignedIn && role === 'staff';
  const onStaffPage =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/requests') ||
    pathname.startsWith('/admin');

  return (
    <header className='border-b bg-white sticky top-0 z-50'>
      <div className='max-w-6xl mx-auto px-4 h-14 flex items-center justify-between'>
        <Link
          href='/'
          className='flex items-center gap-2 font-semibold text-foreground no-underline'
        >
          <BrandMark />
          Smart 311
        </Link>

        <nav className='flex items-center gap-4'>
          {!isSignedIn ? (
            <>
              <SignInButton>
                <Button variant='ghost' size='sm'>
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button size='sm'>Sign Up</Button>
              </SignUpButton>
            </>
          ) : (
            <>
              {isAdmin || isStaff ? (
                <></>
              ) : (
                <>
                  <Link href='/home'>
                    <Button variant='ghost' size='sm'>
                      Home
                    </Button>
                  </Link>
                  <Link href='/submit'>
                    <Button variant='ghost' size='sm'>
                      Submit Request
                    </Button>
                  </Link>
                  <Link href='/my-requests'>
                    <Button variant='ghost' size='sm'>
                      My Requests
                    </Button>
                  </Link>
                </>
              )}
              {userImageUrl && <UserAvatarButton imageUrl={userImageUrl} />}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

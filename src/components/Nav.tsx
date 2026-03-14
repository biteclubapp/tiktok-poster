'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthFormButton from '@/components/AuthFormButton';
import { logout } from '@/app/login/actions';

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/streams', label: 'Streams' },
  { href: '/studio', label: 'Studio' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/trending', label: 'Trending' },
  { href: '/roadmap', label: 'Roadmap' },
];

export default function Nav({ userEmail }: { userEmail?: string | null }) {
  const pathname = usePathname();

  if (pathname === '/login') {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-red-50 flex items-center justify-center border border-red-100">
              <Image
                src="/tomatoonly.png"
                alt="BiteClub logo"
                width={32}
                height={32}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <span className="text-sm font-bold text-gray-900 hidden sm:inline">
              BiteClub Poster
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label }) => {
              const isActive =
                href === '/' ? pathname === '/' : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {userEmail ? (
            <span className="hidden rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600 md:inline-flex">
              {userEmail}
            </span>
          ) : null}
          <form action={logout}>
            <AuthFormButton
              label="Log Out"
              pendingLabel="Logging Out..."
              className="rounded-full border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </form>
        </div>
      </div>
    </nav>
  );
}

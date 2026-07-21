'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch('/api/admin/login', { method: 'DELETE' });
        router.refresh();
      }}
      className="text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
    >
      Sign out
    </button>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        router.refresh();
      } else {
        setError(typeof data.error === 'string' ? data.error : 'Sign-in failed.');
      }
    } catch {
      setError('Sign-in failed. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 w-full max-w-sm"
    >
      <h1 className="text-xl font-bold text-gray-900">Private area</h1>
      <p className="mt-1 text-sm text-gray-500">Enter the admin password to view messages.</p>
      <label htmlFor="admin-password" className="sr-only">
        Password
      </label>
      <input
        id="admin-password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="mt-5 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
      />
      {error && <p className="mt-3 text-sm font-semibold text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="mt-5 w-full bg-[#114D8F] hover:bg-[#0d3d72] disabled:opacity-60 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors"
      >
        {busy ? 'Checking…' : 'Sign in'}
      </button>
    </form>
  );
}

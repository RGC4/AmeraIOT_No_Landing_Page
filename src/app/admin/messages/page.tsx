import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import { ADMIN_COOKIE, verifySession } from '@/lib/adminAuth';
import { getPool } from '@/lib/db';
import LoginForm from './LoginForm';
import LogoutButton from './LogoutButton';

// Private, password-protected inbox of contact form submissions. Not linked
// from anywhere on the public site and excluded from search engines.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Messages',
  robots: { index: false, follow: false },
};

type Submission = {
  id: number;
  created_at: Date;
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
};

export default async function AdminMessagesPage() {
  const cookieStore = await cookies();
  const authed = verifySession(cookieStore.get(ADMIN_COOKIE)?.value);

  if (!authed) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <LoginForm />
      </main>
    );
  }

  let submissions: Submission[] = [];
  let loadError = false;
  try {
    const result = await getPool().query<Submission>(
      `SELECT id, created_at, name, email, company, phone, message
       FROM contact_submissions
       ORDER BY created_at DESC
       LIMIT 500`
    );
    submissions = result.rows;
  } catch (err) {
    console.error('[admin/messages] failed to load submissions:', err);
    loadError = true;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>
            <p className="text-sm text-gray-500 mt-1">
              {submissions.length} message{submissions.length === 1 ? '' : 's'} (newest first)
            </p>
          </div>
          <LogoutButton />
        </div>

        {loadError && (
          <p className="text-sm font-semibold text-red-700 mb-6">
            The message list could not be loaded. Please try again shortly.
          </p>
        )}

        {!loadError && submissions.length === 0 && (
          <p className="text-gray-600">No messages yet.</p>
        )}

        <ul className="space-y-4">
          {submissions.map((s) => (
            <li key={s.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="font-semibold text-gray-900">
                  {s.name}
                  {s.company && <span className="text-gray-500 font-normal"> — {s.company}</span>}
                </div>
                <time className="text-xs text-gray-400" dateTime={s.created_at.toISOString()}>
                  {s.created_at.toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </time>
              </div>
              <div className="mt-1 text-sm text-gray-600">
                <a href={`mailto:${s.email}`} className="text-primary hover:underline">
                  {s.email}
                </a>
                {s.phone && <span className="ml-3">{s.phone}</span>}
              </div>
              <p className="mt-3 text-sm text-gray-800 whitespace-pre-wrap">{s.message}</p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

import { RequireSession } from '@/lib/session';

/** Admin routes need a session with the admin role. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireSession role="admin">
      <div className="container flex max-w-content flex-col gap-6 py-6 md:py-10">{children}</div>
    </RequireSession>
  );
}

import { RequireSession } from '@/lib/session';

/** Every route in this group needs a verified student session. */
export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <RequireSession>{children}</RequireSession>;
}

import { redirect } from 'next/navigation';

/** The admin area is Goods inventory for now. */
export default function AdminHome() {
  redirect('/admin/goods');
}

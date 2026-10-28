import { requireAdmin } from '@/lib/admin/guard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();

  return (
    <div dir="rtl" className="flex min-h-screen bg-cream-50 font-cairo">
      <AdminSidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <AdminTopbar userEmail={user.email ?? ''} />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

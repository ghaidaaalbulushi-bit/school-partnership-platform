import { LogOut } from 'lucide-react';
import { logoutAction } from '@/app/admin/login/actions';

export function AdminTopbar({ userEmail }: { userEmail: string }) {
  return (
    <header className="flex items-center justify-between border-b border-sky-100 bg-white px-4 py-3 md:px-8">
      <p className="text-sm font-semibold text-navy-600">مرحبًا، {userEmail}</p>
      <form action={logoutAction}>
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-full bg-sky-50 px-4 py-2 text-sm font-bold text-navy-700 hover:bg-sky-100"
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </button>
      </form>
    </header>
  );
}

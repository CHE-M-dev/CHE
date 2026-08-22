import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <nav className="flex items-center gap-4 text-sm font-medium text-neutral-600">
            <span className="text-neutral-900">Hub Admin</span>
            <Link href="/admin" className="hover:text-neutral-900">
              Dashboard
            </Link>
            <Link href="/admin/scan" className="hover:text-neutral-900">
              Scan
            </Link>
            <Link href="/admin/members" className="hover:text-neutral-900">
              Members
            </Link>
          </nav>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}

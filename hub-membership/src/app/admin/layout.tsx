import Link from "next/link";
import { getAdminContext } from "@/lib/admin-context";
import { SignOutButton } from "@/components/sign-out-button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isSuperAdmin, features: enabled } = await getAdminContext();

  const links = [
    { href: "/admin", label: "Overview", show: true },
    { href: "/admin/companies", label: "Companies", show: enabled.has("manage_companies") },
    { href: "/admin/members", label: "Members", show: enabled.has("manage_members") },
    { href: "/admin/invites", label: "Invites", show: enabled.has("manage_invites") },
    { href: "/admin/admins", label: "Admins", show: isSuperAdmin || enabled.has("view_admins") },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <nav className="flex items-center gap-4 text-sm font-medium text-neutral-600">
            <span className="text-neutral-900">{isSuperAdmin ? "Super Admin" : "Admin"}</span>
            {links
              .filter((l) => l.show)
              .map((l) => (
                <Link key={l.href} href={l.href} className="hover:text-neutral-900">
                  {l.label}
                </Link>
              ))}
          </nav>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}

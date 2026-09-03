import Link from "next/link";
import { getAdminContext } from "@/lib/admin-context";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isSuperAdmin, features: enabled } = await getAdminContext();

  const links = [
    { href: "/apps/admin", label: "Overview", show: true },
    { href: "/apps/admin/companies", label: "Companies", show: enabled.has("manage_companies") },
    { href: "/apps/admin/admins", label: "Admins", show: isSuperAdmin || enabled.has("view_admins") },
  ];

  return (
    <div>
      <div className="border-b border-neutral-200 bg-white">
        <nav className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 text-sm font-medium text-neutral-600">
          <span className="text-neutral-900">{isSuperAdmin ? "Super Admin" : "Admin"}</span>
          {links
            .filter((l) => l.show)
            .map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-neutral-900">
                {l.label}
              </Link>
            ))}
        </nav>
      </div>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AppsLauncherPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("system_role, headline")
    .eq("id", user!.id)
    .single();

  const isAdmin = profile?.system_role === "super_admin" || profile?.system_role === "admin";

  const tiles = [
    {
      href: "/apps/profile",
      icon: "👤",
      color: "bg-blue-100 text-blue-700",
      label: "Profile",
      description: profile?.headline || "Your profile & experience",
    },
    {
      href: "/apps/directory",
      icon: "🔍",
      color: "bg-emerald-100 text-emerald-700",
      label: "Directory",
      description: "Browse startups on the hub",
    },
    isAdmin && {
      href: "/apps/admin",
      icon: "🛠️",
      color: "bg-purple-100 text-purple-700",
      label: profile?.system_role === "super_admin" ? "Super Admin" : "Admin",
      description: "Manage the platform",
    },
  ].filter(Boolean) as { href: string; icon: string; color: string; label: string; description: string }[];

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-lg font-semibold text-neutral-900">Your apps</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {tiles.map((tile) => (
          <Link
            key={tile.href}
            href={tile.href}
            className="flex flex-col items-center gap-2 rounded-xl border border-neutral-200 bg-white p-5 text-center shadow-sm transition hover:border-neutral-300 hover:shadow-md"
          >
            <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${tile.color}`}>
              {tile.icon}
            </span>
            <span className="text-sm font-semibold text-neutral-900">{tile.label}</span>
            <span className="text-xs text-neutral-500">{tile.description}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}

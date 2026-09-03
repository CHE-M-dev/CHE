import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

export default function AppsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link
            href="/apps"
            className="flex items-center gap-2 text-sm font-semibold text-neutral-900 hover:text-neutral-700"
          >
            <span aria-hidden className="text-lg leading-none">
              ⊞
            </span>
            Apps
          </Link>
          <SignOutButton />
        </div>
      </header>
      {children}
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { InviteGenerator } from "./invite-generator";
import { RemoveMemberButton } from "./remove-member-button";
import { RevokeInviteButton } from "./revoke-invite-button";
import { CompanyProfileForm } from "./company-profile";

const ROLE_LABELS: Record<string, string> = {
  leader: "Leader",
  startup_member: "Startup member",
  employee: "Employee",
};

const FUNDING_STAGE_LABELS: Record<string, string> = {
  bootstrapped: "Bootstrapped",
  pre_seed: "Pre-seed",
  seed: "Seed",
  series_a: "Series A",
  series_b: "Series B",
  series_c_plus: "Series C+",
  public: "Public",
  acquired: "Acquired",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: me } = await supabase
    .from("company_members")
    .select("id, company_id, company_role")
    .eq("user_id", user!.id)
    .single();

  if (!me) return null;

  const isLeader = me.company_role === "leader";

  const [{ data: company }, { data: members }, { data: invites }] = await Promise.all([
    supabase.from("companies").select("*").eq("id", me.company_id).single(),
    supabase
      .from("company_members")
      .select("id, user_id, company_role, created_at, profiles(full_name, email)")
      .eq("company_id", me.company_id)
      .order("created_at", { ascending: true }),
    isLeader
      ? supabase
          .from("invites")
          .select("id, role, token, uses_count, max_uses, revoked, expires_at, created_at")
          .eq("company_id", me.company_id)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: null }),
  ]);

  const startupMembers = (members ?? []).filter((m) => m.company_role === "startup_member");
  const employees = (members ?? []).filter((m) => m.company_role === "employee");
  const leader = (members ?? []).find((m) => m.company_role === "leader");

  return (
    <div className="space-y-8">
      {isLeader && <InviteGenerator />}

      <Section title="Company profile">
        {isLeader && company ? (
          <CompanyProfileForm company={company} />
        ) : (
          company && <CompanyProfileSummary company={company} />
        )}
      </Section>

      <Section title="Team leader">
        {leader && <MemberRow member={leader} showRemove={false} />}
      </Section>

      <Section title={`Startup members (${startupMembers.length})`}>
        {startupMembers.length === 0 ? (
          <EmptyState label="No startup members yet." />
        ) : (
          startupMembers.map((m) => <MemberRow key={m.id} member={m} showRemove={isLeader} />)
        )}
      </Section>

      <Section title={`Employees (${employees.length})`}>
        {employees.length === 0 ? (
          <EmptyState label="No employees yet." />
        ) : (
          employees.map((m) => <MemberRow key={m.id} member={m} showRemove={isLeader} />)
        )}
      </Section>

      {isLeader && (
        <Section title="Invite links">
          {!invites || invites.length === 0 ? (
            <EmptyState label="No invite links created yet." />
          ) : (
            invites.map((inv) => {
              const isValid =
                !inv.revoked && inv.uses_count < inv.max_uses && new Date(inv.expires_at) > new Date();
              return (
                <div key={inv.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <span className="font-medium text-neutral-800">
                      {ROLE_LABELS[inv.role]} invite
                    </span>
                    <span className="ml-2 text-neutral-500">
                      {inv.uses_count}/{inv.max_uses} used ·{" "}
                      {isValid ? "active" : inv.revoked ? "revoked" : "expired"}
                    </span>
                  </div>
                  {isValid && <RevokeInviteButton inviteId={inv.id} />}
                </div>
              );
            })
          )}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-neutral-900">{title}</h2>
      <div className="divide-y divide-neutral-100">{children}</div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <p className="py-2 text-sm text-neutral-500">{label}</p>;
}

function CompanyProfileSummary({
  company,
}: {
  company: {
    industry: string | null;
    company_size: string | null;
    funding_stage: string | null;
    founded_year: number | null;
    website: string | null;
    phone: string | null;
    address: string | null;
    description: string | null;
  };
}) {
  const rows: [string, string | null][] = [
    ["Industry", company.industry],
    ["Company size", company.company_size ? `${company.company_size} employees` : null],
    ["Funding stage", company.funding_stage ? FUNDING_STAGE_LABELS[company.funding_stage] : null],
    ["Founded", company.founded_year ? String(company.founded_year) : null],
    ["Website", company.website],
    ["Phone", company.phone],
    ["Address", company.address],
  ];
  const filled = rows.filter(([, value]) => value);

  if (filled.length === 0 && !company.description) {
    return <p className="text-sm text-neutral-500">The team leader hasn&apos;t filled this in yet.</p>;
  }

  return (
    <div className="space-y-3 text-sm">
      {company.description && <p className="text-neutral-700">{company.description}</p>}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
        {filled.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-neutral-500">{label}</dt>
            <dd className="text-neutral-800">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function MemberRow({
  member,
  showRemove,
}: {
  member: {
    id: string;
    company_role: string;
    profiles: { full_name: string; email: string } | null;
  };
  showRemove: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-neutral-800">
          {member.profiles?.full_name || member.profiles?.email || "Unknown"}
        </p>
        <p className="text-xs text-neutral-500">{member.profiles?.email}</p>
      </div>
      {showRemove && (
        <RemoveMemberButton
          memberRowId={member.id}
          name={member.profiles?.full_name || member.profiles?.email || "this person"}
        />
      )}
    </div>
  );
}

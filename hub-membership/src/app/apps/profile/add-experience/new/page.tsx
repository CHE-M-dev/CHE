import { CreateCompanyForm } from "./create-company-form";

export default function CreateCompanyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <h1 className="text-lg font-semibold text-neutral-900">Create your startup&apos;s page</h1>
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <CreateCompanyForm />
      </div>
    </div>
  );
}

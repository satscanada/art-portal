import { AdminNav } from "@/components/admin/AdminNav";
import { ExhibitionForm } from "@/components/admin/ExhibitionForm";

export default function AdminNewNewsPage() {
  return (
    <div>
      <AdminNav />
      <h1 className="display mb-6 text-4xl text-ink">New exhibition / news</h1>
      <ExhibitionForm />
    </div>
  );
}

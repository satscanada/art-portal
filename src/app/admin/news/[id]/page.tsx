import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { ExhibitionForm } from "@/components/admin/ExhibitionForm";
import { getExhibitionByIdAdmin } from "@/lib/exhibitions";

export default function AdminEditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div>
      <AdminNav />
      <h1 className="display mb-6 text-4xl text-ink">Edit news</h1>
      <Suspense
        fallback={
          <div className="h-40 animate-pulse rounded-[1.5rem] bg-white/50" />
        }
      >
        <EditForm params={params} />
      </Suspense>
    </div>
  );
}

async function EditForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exhibition = await getExhibitionByIdAdmin(id);
  if (!exhibition) notFound();
  return <ExhibitionForm exhibition={exhibition} />;
}

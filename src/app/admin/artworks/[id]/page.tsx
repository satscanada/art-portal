import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { ArtworkForm } from "@/components/admin/ArtworkForm";
import { getArtworkByIdAdmin, listTags } from "@/lib/artworks";

export default function EditArtworkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div>
      <AdminNav />
      <h1 className="display mb-6 text-4xl text-ink">Edit artwork</h1>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-[1.5rem] bg-white/50" />}>
        <EditArtworkForm params={params} />
      </Suspense>
    </div>
  );
}

async function EditArtworkForm({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [artwork, tags] = await Promise.all([
    getArtworkByIdAdmin(id),
    listTags(),
  ]);

  if (!artwork) notFound();

  return <ArtworkForm artwork={artwork} tags={tags} />;
}

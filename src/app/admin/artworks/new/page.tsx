import { Suspense } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { ArtworkForm } from "@/components/admin/ArtworkForm";
import { listTags } from "@/lib/artworks";

export default function NewArtworkPage() {
  return (
    <div>
      <AdminNav />
      <h1 className="display mb-6 text-4xl text-ink">Upload artwork</h1>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-[1.5rem] bg-white/50" />}>
        <NewArtworkForm />
      </Suspense>
    </div>
  );
}

async function NewArtworkForm() {
  const tags = await listTags();
  return <ArtworkForm tags={tags} />;
}

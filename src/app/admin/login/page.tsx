import { Suspense } from "react";
import { loginAction } from "@/lib/actions/admin";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="display text-4xl text-ink">Admin sign in</h1>
      <p className="mt-2 text-muted">
        Use the Supabase Auth user you created for this portal.
      </p>
      <Suspense fallback={<div className="mt-8 h-56 animate-pulse rounded-[1.5rem] bg-white/50" />}>
        <LoginForm searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;

  return (
    <form
      action={loginAction}
      className="surface-panel mt-8 space-y-4 rounded-[1.5rem] p-6"
    >
      <input type="hidden" name="next" value={params.next ?? "/admin"} />
      <label className="block space-y-2 text-sm">
        <span className="uppercase tracking-[0.16em] text-muted">Email</span>
        <input
          type="email"
          name="email"
          required
          className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-accent"
        />
      </label>
      <label className="block space-y-2 text-sm">
        <span className="uppercase tracking-[0.16em] text-muted">Password</span>
        <input
          type="password"
          name="password"
          required
          className="w-full rounded-xl border border-line bg-white px-4 py-3 outline-none focus:border-accent"
        />
      </label>
      {params.error ? (
        <p className="text-sm text-red-700">{params.error}</p>
      ) : null}
      <button
        type="submit"
        className="w-full rounded-full bg-ink px-5 py-3 text-sm font-medium uppercase tracking-[0.14em] text-white transition hover:bg-accent"
      >
        Sign in
      </button>
    </form>
  );
}

"use client";

import { Suspense } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] bg-[#F8FAFC] flex items-center justify-center p-6">
          <div className="text-slate-500 font-bold">Loading...</div>
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const nextPath = useMemo(() => {
    const raw = searchParams?.get("next") || "/dashboard";
    if (raw.startsWith("http://") || raw.startsWith("https://")) return "/dashboard";
    return raw.startsWith("/") ? raw : "/dashboard";
  }, [searchParams]);

  useEffect(() => {
    const run = async () => {
      try {
        // Supabase puts tokens in the URL hash for recovery links.
        const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
        const params = new URLSearchParams(hash);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) throw error;
        }

        router.replace(nextPath);
      } catch (e: any) {
        setError(e?.message || "Authentication failed.");
      }
    };

    run();
  }, [router, nextPath]);

  return (
    <div className="min-h-[60vh] bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="bg-white border border-slate-100 shadow-sm rounded-[2rem] p-8 max-w-md w-full text-center">
        <div className="text-[#1C3D5A] font-black text-xl mb-2">Finishing sign-in…</div>
        <div className="text-slate-500 font-medium">
          {error ? <span className="text-rose-600 font-semibold">{error}</span> : "Please wait a moment."}
        </div>
      </div>
    </div>
  );
}


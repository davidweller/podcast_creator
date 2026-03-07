"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ScriptsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  useEffect(() => {
    router.replace(`/project/${projectId}/scripts/90min`);
  }, [projectId, router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-slate-600">Redirecting...</div>
    </div>
  );
}

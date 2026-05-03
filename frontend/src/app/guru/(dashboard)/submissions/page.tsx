"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ClassAccordion } from "@/components/guru/dashboard/submissions/class-accordion";
import {
  fetchClassesWithAssignments,
  type ClassWithAssignments,
} from "@/lib/api/submissions";

export default function SubmissionsPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassWithAssignments[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auth guard
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/guru/login");
        return;
      }

      // Fetch data
      fetchClassesWithAssignments()
        .then(setClasses)
        .catch(console.error)
        .finally(() => setLoading(false));
    });
  }, [router]);

  return (
    <div className="mx-auto max-w-[1120px]">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#191B23]">Submissions</h1>
        <p className="text-sm text-[#565F6B]">
          Manage, review, and give score for your students assignments
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2563EB] border-t-transparent" />
        </div>
      ) : classes.length === 0 ? (
        <div className="rounded-xl border border-[#F1F5F9] bg-white px-6 py-24 text-center">
          <p className="text-base text-[#94A3B8]">
            No classes found. Create a class first to manage submissions.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {classes.map((cls, index) => (
            <ClassAccordion
              key={cls.id}
              classData={cls}
              defaultExpanded={index === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

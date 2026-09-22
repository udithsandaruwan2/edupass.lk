import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useClasses } from "@/hooks/use-api";
import { useQuery } from "@tanstack/react-query";
import { listInstituteStudents } from "@/services/api";
import { EmptyState } from "@/components/empty-state";
import { getStore } from "@/mocks/store";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/institute/students")({
  head: () => ({ meta: [{ title: "Students | edupass.lk" }] }),
  component: InstituteStudents,
});

function InstituteStudents() {
  const { user } = useAuth();
  const instituteId = user?.instituteId ?? "inst-lvi";
  const { data: classes } = useClasses(instituteId);
  const { data: students, isLoading } = useQuery({
    queryKey: ["institute-students", instituteId],
    queryFn: () => listInstituteStudents(instituteId),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Students</h1>
      <p className="mt-1 text-sm text-muted-foreground">Roster across your classes.</p>
      <div className="mt-8 space-y-3">
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : students && students.length > 0 ? (
          students.map((s) => {
            const enrolled =
              classes?.filter((c) => c.studentIds.includes(s.id)).map((c) => c.name) ?? [];
            return (
              <div key={s.id} className="rounded-xl border border-border bg-card px-4 py-3">
                <p className="font-medium">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.email}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {enrolled.join(" · ") || "No classes"}
                </p>
              </div>
            );
          })
        ) : (
          <EmptyState
            title="No students yet"
            description="Enrol students into classes to build your roster."
          />
        )}
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        Demo roster includes Amaya Silva and Nimal Perera from seed data (
        {getStore().institutes.find((i) => i.id === instituteId)?.name}).
      </p>
    </div>
  );
}

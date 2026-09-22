import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useClasses } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { markClassAttendance, listAttendance } from "@/services/api";
import { getStore } from "@/mocks/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatShortDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/institute/attendance")({
  head: () => ({ meta: [{ title: "Class attendance | edupass.lk" }] }),
  component: InstituteAttendance,
});

function InstituteAttendance() {
  const { user } = useAuth();
  const instituteId = user?.instituteId ?? "inst-lvi";
  const { data: classes } = useClasses(instituteId);
  const [classId, setClassId] = useState<string>("");
  const selected = classes?.find((c) => c.id === (classId || classes[0]?.id));
  const qc = useQueryClient();
  const { data: attendance } = useQuery({
    queryKey: ["attendance"],
    queryFn: () => listAttendance(),
  });

  const classAttendance = (attendance ?? []).filter((a) => a.classId === selected?.id);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Class attendance</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Mark present / absent for today&apos;s batch.
      </p>

      <div className="mt-6 max-w-sm">
        <Select value={selected?.id} onValueChange={setClassId}>
          <SelectTrigger>
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {(classes ?? []).map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selected ? (
        <div className="mt-8 space-y-3">
          {selected.studentIds.map((sid) => {
            const student = getStore().users.find((u) => u.id === sid);
            return (
              <div
                key={sid}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
              >
                <span className="font-medium">{student?.name ?? sid}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      void markClassAttendance({
                        classId: selected.id,
                        studentId: sid,
                        present: true,
                      }).then(() => {
                        toast.success("Marked present");
                        void qc.invalidateQueries({ queryKey: ["attendance"] });
                      });
                    }}
                  >
                    Present
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      void markClassAttendance({
                        classId: selected.id,
                        studentId: sid,
                        present: false,
                      }).then(() => {
                        toast.message("Marked absent");
                        void qc.invalidateQueries({ queryKey: ["attendance"] });
                      });
                    }}
                  >
                    Absent
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {classAttendance.length > 0 ? (
        <div className="mt-10">
          <h2 className="font-display text-lg font-semibold">Recent marks</h2>
          <div className="mt-3 space-y-2">
            {classAttendance.slice(0, 10).map((a) => {
              const student = getStore().users.find((u) => u.id === a.studentId);
              return (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <span>
                    {student?.name} · {formatShortDate(a.markedAt)}
                  </span>
                  <Badge variant={a.present ? "default" : "destructive"}>
                    {a.present ? "Present" : "Absent"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

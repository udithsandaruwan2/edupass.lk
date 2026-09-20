import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useClasses } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClass, formatLkr } from "@/services/api";
import { useQueryClient } from "@tanstack/react-query";
import type { ExamLevel, Medium } from "@/domain/types";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/institute/classes")({
  head: () => ({ meta: [{ title: "Classes | edupass.lk" }] }),
  component: InstituteClasses,
});

function InstituteClasses() {
  const { user } = useAuth();
  const instituteId = user?.instituteId ?? "inst-lvi";
  const { data } = useClasses(instituteId);
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Classes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Weekly tuition batches.</p>
        </div>
        <Button onClick={() => setOpen((v) => !v)}>{open ? "Close" : "New class"}</Button>
      </div>

      {open ? (
        <ClassForm
          instituteId={instituteId}
          onDone={() => {
            setOpen(false);
            void qc.invalidateQueries({ queryKey: ["classes"] });
          }}
        />
      ) : null}

      <div className="mt-8 space-y-3">
        {(data ?? []).map((c) => (
          <div key={c.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-display text-lg font-semibold">{c.name}</p>
                <p className="text-sm text-muted-foreground">
                  {c.schedule} · {formatLkr(c.monthlyFee)}/mo
                </p>
              </div>
              <div className="flex gap-1">
                <Badge>{c.level}</Badge>
                <Badge variant="secondary">{c.medium}</Badge>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{c.studentIds.length} student(s)</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClassForm({ instituteId, onDone }: { instituteId: string; onDone: () => void }) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [schedule, setSchedule] = useState("Saturdays 8:00–12:00");
  const [monthlyFee, setMonthlyFee] = useState(5000);
  const [level, setLevel] = useState<ExamLevel>("A/L");
  const [medium, setMedium] = useState<Medium>("Sinhala");

  return (
    <form
      className="mt-6 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        void createClass({
          instituteId,
          name,
          subject,
          schedule,
          monthlyFee,
          level,
          medium,
          studentIds: [],
        }).then(() => {
          toast.success("Class created");
          onDone();
        });
      }}
    >
      <div className="sm:col-span-2">
        <Label>Class name</Label>
        <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label>Subject</Label>
        <Input
          className="mt-1"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
      </div>
      <div>
        <Label>Monthly fee</Label>
        <Input
          className="mt-1"
          type="number"
          value={monthlyFee}
          onChange={(e) => setMonthlyFee(Number(e.target.value))}
          required
        />
      </div>
      <div className="sm:col-span-2">
        <Label>Schedule</Label>
        <Input
          className="mt-1"
          value={schedule}
          onChange={(e) => setSchedule(e.target.value)}
          required
        />
      </div>
      <div>
        <Label>Level</Label>
        <select
          className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          value={level}
          onChange={(e) => setLevel(e.target.value as ExamLevel)}
        >
          <option value="O/L">O/L</option>
          <option value="A/L">A/L</option>
        </select>
      </div>
      <div>
        <Label>Medium</Label>
        <select
          className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          value={medium}
          onChange={(e) => setMedium(e.target.value as Medium)}
        >
          <option value="Sinhala">Sinhala</option>
          <option value="English">English</option>
          <option value="Tamil">Tamil</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <Button type="submit">Save class</Button>
      </div>
    </form>
  );
}

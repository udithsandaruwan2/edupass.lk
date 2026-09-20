import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useSeminars } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteSeminar, formatLkr, upsertSeminar } from "@/services/api";
import { uid } from "@/mocks/store";
import { getStore } from "@/mocks/store";
import { useQueryClient } from "@tanstack/react-query";
import { formatSeminarWhen } from "@/lib/format";
import type { ExamLevel, Medium } from "@/domain/types";

export const Route = createFileRoute("/admin/seminars")({
  head: () => ({ meta: [{ title: "Admin seminars | edupass.lk" }] }),
  component: AdminSeminars,
});

function AdminSeminars() {
  const { data } = useSeminars();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Seminars</h1>
          <p className="mt-1 text-sm text-muted-foreground">Create and manage public sessions.</p>
        </div>
        <Button onClick={() => setOpen((v) => !v)}>{open ? "Close" : "Add seminar"}</Button>
      </div>

      {open ? (
        <SeminarForm
          onDone={() => {
            setOpen(false);
            void qc.invalidateQueries({ queryKey: ["seminars"] });
          }}
        />
      ) : null}

      <div className="mt-8 space-y-2">
        {(data ?? []).map((s) => (
          <div
            key={s.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
          >
            <div>
              <p className="font-medium">
                {s.subject} · {s.level}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatSeminarWhen(s.startsAt)} · {s.city} · {formatLkr(s.price)}
              </p>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                void deleteSeminar(s.id).then(() => {
                  toast.success("Deleted");
                  void qc.invalidateQueries({ queryKey: ["seminars"] });
                });
              }}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeminarForm({ onDone }: { onDone: () => void }) {
  const lecturers = getStore().lecturers;
  const [subject, setSubject] = useState("Combined Mathematics");
  const [level, setLevel] = useState<ExamLevel>("A/L");
  const [medium, setMedium] = useState<Medium>("Sinhala");
  const [lecturerId, setLecturerId] = useState(lecturers[0]?.id ?? "");
  const [venue, setVenue] = useState("Colombo Hall");
  const [city, setCity] = useState("Colombo");
  const [price, setPrice] = useState(4000);
  const [seats, setSeats] = useState(40);
  const [startsAt, setStartsAt] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    d.setHours(9, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });

  return (
    <form
      className="mt-6 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const start = new Date(startsAt);
        const end = new Date(start);
        end.setHours(end.getHours() + 4);
        void upsertSeminar({
          id: uid("sem"),
          lecturerId,
          subject,
          level,
          medium,
          venue,
          city,
          startsAt: start.toISOString(),
          endsAt: end.toISOString(),
          price,
          seats,
          seatsLeft: seats,
          description: `${subject} seminar hosted via edupass.lk`,
        }).then(() => {
          toast.success("Seminar created");
          onDone();
        });
      }}
    >
      <Field label="Subject">
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} required />
      </Field>
      <Field label="Lecturer">
        <select
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          value={lecturerId}
          onChange={(e) => setLecturerId(e.target.value)}
        >
          {lecturers.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Level">
        <select
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          value={level}
          onChange={(e) => setLevel(e.target.value as ExamLevel)}
        >
          <option value="O/L">O/L</option>
          <option value="A/L">A/L</option>
        </select>
      </Field>
      <Field label="Medium">
        <select
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          value={medium}
          onChange={(e) => setMedium(e.target.value as Medium)}
        >
          <option value="Sinhala">Sinhala</option>
          <option value="English">English</option>
          <option value="Tamil">Tamil</option>
        </select>
      </Field>
      <Field label="Venue">
        <Input value={venue} onChange={(e) => setVenue(e.target.value)} required />
      </Field>
      <Field label="City">
        <Input value={city} onChange={(e) => setCity(e.target.value)} required />
      </Field>
      <Field label="Starts">
        <Input
          type="datetime-local"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          required
        />
      </Field>
      <Field label="Price (LKR)">
        <Input
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          required
        />
      </Field>
      <Field label="Seats">
        <Input
          type="number"
          value={seats}
          onChange={(e) => setSeats(Number(e.target.value))}
          required
        />
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit">Save seminar</Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1">{label}</Label>
      {children}
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useLecturers } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { upsertLecturer } from "@/services/api";
import { uid } from "@/mocks/store";
import { useQueryClient } from "@tanstack/react-query";
import type { ExamLevel, Lecturer, Medium } from "@/domain/types";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/lecturers")({
  head: () => ({ meta: [{ title: "Admin lecturers | edupass.lk" }] }),
  component: AdminLecturers,
});

function AdminLecturers() {
  const { data } = useLecturers();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Lecturers</h1>
          <p className="mt-1 text-sm text-muted-foreground">Onboard tuition masters.</p>
        </div>
        <Button onClick={() => setOpen((v) => !v)}>{open ? "Close" : "Add lecturer"}</Button>
      </div>

      {open ? (
        <LecturerForm
          onDone={() => {
            setOpen(false);
            void qc.invalidateQueries({ queryKey: ["lecturers"] });
          }}
        />
      ) : null}

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {(data ?? []).map((l) => (
          <div key={l.id} className="rounded-xl border border-border bg-card p-4">
            <p className="font-display text-lg font-semibold">{l.name}</p>
            <p className="text-sm text-muted-foreground">{l.title}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {l.levels.map((lv) => (
                <Badge key={lv} variant="secondary">
                  {lv}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LecturerForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("Colombo");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState<ExamLevel>("A/L");
  const [medium, setMedium] = useState<Medium>("Sinhala");

  return (
    <form
      className="mt-6 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        const lecturer: Lecturer = {
          id: uid("lec"),
          slug: slug || uid("lec"),
          name,
          title,
          bio,
          subjects: [subject],
          levels: [level],
          mediums: [medium],
          city,
          photoHue: Math.floor(Math.random() * 300),
        };
        void upsertLecturer(lecturer).then(() => {
          toast.success("Lecturer added");
          onDone();
        });
      }}
    >
      <div>
        <Label>Name</Label>
        <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label>Title</Label>
        <Input className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="sm:col-span-2">
        <Label>Bio</Label>
        <Textarea className="mt-1" value={bio} onChange={(e) => setBio(e.target.value)} required />
      </div>
      <div>
        <Label>Primary subject</Label>
        <Input
          className="mt-1"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
      </div>
      <div>
        <Label>City</Label>
        <Input className="mt-1" value={city} onChange={(e) => setCity(e.target.value)} required />
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
        <Button type="submit">Save lecturer</Button>
      </div>
    </form>
  );
}

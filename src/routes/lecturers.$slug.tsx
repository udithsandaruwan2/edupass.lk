import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { SeminarCard } from "@/components/seminar-card";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";
import { getLecturerBySlug, listSeminars } from "@/services/api";
import { hydrateStore } from "@/mocks/store";
import { lecturerPhotoBySlug } from "@/lib/images";

export const Route = createFileRoute("/lecturers/$slug")({
  loader: async ({ params }) => {
    hydrateStore();
    const lecturer = await getLecturerBySlug(params.slug);
    if (!lecturer) throw notFound();
    const seminars = await listSeminars({ lecturerId: lecturer.id });
    return { lecturer, seminars };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData ? `${loaderData.lecturer.name} | edupass.lk` : "Lecturer | edupass.lk",
      },
    ],
  }),
  component: LecturerProfilePage,
});

function LecturerProfilePage() {
  const { lecturer, seminars } = Route.useLoaderData();
  const photo = lecturerPhotoBySlug(lecturer.slug);

  return (
    <SiteShell>
      <section className="mx-auto max-w-6xl px-5 py-12">
        <Reveal>
          <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:flex-row sm:items-start sm:p-8">
            <img
              src={photo}
              alt=""
              className="size-24 shrink-0 rounded-full object-cover ring-4 ring-accent-soft sm:size-28"
            />
            <div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
                {lecturer.name}
              </h1>
              <p className="mt-1 text-muted-foreground">{lecturer.title}</p>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {lecturer.bio}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {lecturer.levels.map((l) => (
                  <Badge key={l}>{l}</Badge>
                ))}
                {lecturer.mediums.map((m) => (
                  <Badge key={m} variant="secondary">
                    {m}
                  </Badge>
                ))}
                <Badge variant="outline">{lecturer.city}</Badge>
              </div>
            </div>
          </div>
        </Reveal>

        <h2 className="mt-12 font-display text-2xl font-semibold text-ink">Upcoming seminars</h2>
        {seminars.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No upcoming seminars listed.</p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {seminars.map((s, i) => (
              <Reveal key={s.id} delay={50 * i}>
                <SeminarCard seminar={s} />
              </Reveal>
            ))}
          </div>
        )}
        <Link to="/lecturers" className="mt-10 inline-block text-sm font-medium text-primary">
          ← All lecturers
        </Link>
      </section>
    </SiteShell>
  );
}

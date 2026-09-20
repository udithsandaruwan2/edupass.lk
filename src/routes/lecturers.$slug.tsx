import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { SeminarCard } from "@/components/seminar-card";
import { Badge } from "@/components/ui/badge";
import { getLecturerBySlug, listSeminars } from "@/services/api";
import { hydrateStore } from "@/mocks/store";

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

  return (
    <SiteShell>
      <section className="py-12">
        <div className="rise flex flex-col gap-6 sm:flex-row sm:items-start">
          <div
            className="flex size-20 shrink-0 items-center justify-center rounded-full font-display text-2xl font-semibold text-primary-foreground"
            style={{ background: `oklch(0.55 0.1 ${lecturer.photoHue})` }}
          >
            {lecturer.name
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">{lecturer.name}</h1>
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

        <h2 className="mt-12 font-display text-2xl font-semibold">Upcoming seminars</h2>
        {seminars.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No upcoming seminars listed.</p>
        ) : (
          <div className="mt-4 grid gap-x-10 border-t border-border md:grid-cols-2">
            {seminars.map((s, i) => (
              <SeminarCard key={s.id} seminar={s} delay={40 * i} />
            ))}
          </div>
        )}
        <Link to="/lecturers" className="mt-8 inline-block text-sm text-primary">
          ← All lecturers
        </Link>
      </section>
    </SiteShell>
  );
}

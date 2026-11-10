import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Badge, container } from './ui/Primitives';
import { Button } from './ui/Button';

export const CtaBanner: React.FC = () => (
  <section aria-labelledby="cta-title" className={`${container} py-12 sm:py-16`}>
    <div className="relative overflow-hidden rounded-lg border border-line bg-surface px-6 py-10 sm:px-12 sm:py-14">
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-brand/10 blur-3xl" />
      <div className="relative grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
        <div className="max-w-2xl">
          <Badge>
            <Sparkles className="size-3.5" aria-hidden="true" />
            For lecturers & institutes
          </Badge>
          <h2 id="cta-title" className="mt-4 text-2xl font-bold tracking-tight text-fg sm:text-3xl">
            Are you an educational institute or lecturer?
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted">
            List your seminar, manage seat allocations, and issue QR admission passes from one dashboard.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
          <Button to="/register/organiser" size="lg" className="group">
            Publish your seminar
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Button>
          <Button to="/contact?topic=organiser" variant="secondary" size="lg">
            Talk to our team
          </Button>
        </div>
      </div>
    </div>
  </section>
);

import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-border bg-card/50">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:py-16">
        <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1 text-xs font-medium text-primary-deep">
          <span className="size-1.5 rounded-full bg-primary" />
          {eyebrow}
        </span>
        <h1 className="mt-5 max-w-[22ch] text-4xl font-semibold leading-tight text-balance sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
          {intro}
        </p>
        {children ? <div className="mt-8 flex flex-wrap gap-3">{children}</div> : null}
      </div>
    </section>
  );
}

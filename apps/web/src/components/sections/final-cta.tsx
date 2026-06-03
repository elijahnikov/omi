"use client";

import { Button } from "@omi/ui/button";
import { ArrowRight } from "lucide-react";
import { Reveal } from "~/components/motion/reveal";
import { links } from "~/lib/site";

export function FinalCta() {
  return (
    <section aria-label="Get started" className="px-5 py-24 sm:px-8 sm:py-32">
      <Reveal className="relative mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 text-center shadow-soft-lg sm:px-10">
        <div className="relative mx-auto flex flex-col items-center">
          <h2 className="text-balance text-3xl text-display text-foreground">
            Start building your second brain today.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Free to start. Capture anything, find it by meaning, and let your AI
            do the rest.
          </p>
          <div className="mt-8">
            <Button
              render={
                <a href={links.register}>
                  Get started — free
                  <ArrowRight size={16} />
                </a>
              }
              size="xlarge"
              variant="omi"
            />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

"use client";

import { Button } from "@omi/ui/button";
import { ArrowRight } from "lucide-react";
import { Eyebrow } from "~/components/marketing/eyebrow";
import { Reveal } from "~/components/motion/reveal";
import { links } from "~/lib/site";

export function FinalCta() {
  return (
    <section aria-label="Get started" className="px-5 py-24 sm:px-8 sm:py-32">
      <Reveal className="relative mx-auto w-full max-w-xl overflow-hidden rounded-3xl bg-card px-6 py-16 text-center shadow-borders-base sm:px-10">
        <div className="relative mx-auto flex flex-col items-center">
          <Eyebrow>Get started</Eyebrow>
          <h2 className="mt-5 text-balance text-3xl text-display text-foreground">
            Start building your second brain today.
          </h2>
          <p className="mt-4 max-w-md font-medium text-sm text-ui-fg-muted">
            Free to start. Capture anything, find it by meaning, and let your AI
            do the rest.
          </p>
          <div className="mt-8">
            <Button
              render={
                <a href={links.register}>
                  Get started for free
                  <ArrowRight size={16} />
                </a>
              }
              size="base"
              variant="omi"
            />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

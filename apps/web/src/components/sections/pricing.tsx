"use client";

import { cn } from "@omi/ui";
import { Button } from "@omi/ui/button";
import { Check } from "lucide-react";
import { Eyebrow } from "~/components/marketing/eyebrow";
import { Section } from "~/components/marketing/section";
import { Stagger, StaggerItem } from "~/components/motion/stagger";
import { pricingTiers } from "~/lib/pricing";

export function Pricing() {
  return (
    <Section ariaLabel="Pricing" id="pricing">
      <div className="max-w-2xl">
        <Eyebrow>Pricing</Eyebrow>
        <h2 className="mt-5 text-balance text-3xl text-display text-foreground">
          Start free. Upgrade when it clicks.
        </h2>
      </div>

      <Stagger className="mt-12 grid gap-4">
        {pricingTiers.map((tier) => (
          <StaggerItem className="h-full" key={tier.name}>
            <div
              className={cn(
                "flex h-full flex-col rounded-2xl bg-card p-6 shadow-borders-base"
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground text-lg">
                  {tier.name}
                </h3>
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl text-display text-foreground">
                  {tier.price}
                </span>
                {tier.cadence ? (
                  <span className="text-muted-foreground text-sm">
                    {tier.cadence}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-muted-foreground text-sm">
                {tier.tagline}
              </p>

              <ul className="mt-6 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li
                    className="flex items-start gap-2.5 text-sm"
                    key={feature}
                  >
                    <Check
                      className="mt-0.5 shrink-0 text-blue-500"
                      size={16}
                    />
                    <span className="font-medium text-ui-fg-subtle">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className="mt-7 w-full"
                render={<a href={tier.cta.href}>{tier.cta.label}</a>}
                size="large"
                variant={tier.featured ? "omi" : "outline"}
              />
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </Section>
  );
}

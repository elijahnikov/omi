import { KeyRound, Lock } from "lucide-react";
import { Eyebrow } from "~/components/marketing/eyebrow";
import { Section } from "~/components/marketing/section";
import { Reveal } from "~/components/motion/reveal";

const providers = ["Claude", "OpenAI", "Google"];

export function ByoKeys() {
  return (
    <Section ariaLabel="Your AI, your data">
      <Reveal className="relative overflow-hidden rounded-3xl border border-border bg-sidebar p-8 sm:p-10">
        <div className="relative flex flex-col items-start gap-6">
          <div>
            <Eyebrow>bring_your_own_key</Eyebrow>
            <h2 className="mt-5 text-balance text-3xl text-display text-foreground">
              Your AI. Your data. Your keys.
            </h2>
            <p className="mt-4 max-w-xl font-medium text-sm text-ui-fg-muted">
              Use Claude, OpenAI, or Google with your own API keys — encrypted
              at rest. Run AI on your own account and keep full control of your
              models, cost, and privacy.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {providers.map((p) => (
                <span
                  className="rounded-full border border-border bg-card px-3 py-1 font-mono text-foreground text-xs"
                  key={p}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 gap-3">
            <span className="flex size-14 items-center justify-center rounded-2xl border border-border bg-card text-foreground shadow-soft-sm">
              <KeyRound size={22} />
            </span>
            <span className="flex size-14 items-center justify-center rounded-2xl border border-border bg-card text-foreground shadow-soft-sm">
              <Lock size={22} />
            </span>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

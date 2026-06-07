import type { ComponentType } from "react";
import {
  ClaudeLogo,
  GoogleLogo,
  OpenAILogo,
} from "~/components/marketing/ai-provider-logos";
import { Eyebrow } from "~/components/marketing/eyebrow";
import { Section } from "~/components/marketing/section";
import { Reveal } from "~/components/motion/reveal";

const providers: {
  Logo: ComponentType<{ className?: string }>;
  label: string;
  logoClassName?: string;
}[] = [
  { label: "Claude", Logo: ClaudeLogo, logoClassName: "size-4" },
  { label: "OpenAI", Logo: OpenAILogo, logoClassName: "size-4" },
  { label: "Google", Logo: GoogleLogo, logoClassName: "size-4" },
];

export function ByoKeys() {
  return (
    <Section ariaLabel="Your AI, your data">
      <Reveal className="relative overflow-hidden">
        <div className="relative flex flex-col items-start gap-6 pb-1">
          <div>
            <Eyebrow>BYOK</Eyebrow>
            <h2 className="mt-5 text-balance text-3xl text-display text-foreground">
              Your AI. Your data. Your keys.
            </h2>
            <p className="mt-4 max-w-xl font-medium text-sm text-ui-fg-muted">
              Use Claude, OpenAI, or Google with your own API keys — encrypted
              at rest. Run AI on your own account and keep full control of your
              models, cost, and privacy.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {providers.map(({ label, Logo, logoClassName }) => (
                <span
                  className="flex items-center gap-2 rounded-full bg-card px-3 py-1.5 shadow-borders-base"
                  key={label}
                >
                  <Logo aria-hidden className={logoClassName} />
                  <span className="font-medium text-sm text-ui-fg-subtle">
                    {label}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

import { Plus } from "lucide-react";
import { Eyebrow } from "~/components/marketing/eyebrow";
import { Section } from "~/components/marketing/section";
import { Reveal } from "~/components/motion/reveal";
import { faqItems } from "~/lib/faq";

export function Faq() {
  return (
    <Section ariaLabel="Frequently asked questions" id="faq">
      <div className="flex flex-col">
        <div>
          <Eyebrow>FAQ</Eyebrow>
          <h2 className="mt-5 text-balance text-3xl text-display text-foreground">
            Questions, answered.
          </h2>
        </div>

        <Reveal className="mt-10 divide-y divide-border border-border border-t">
          {faqItems.map((item) => (
            <details
              className="group py-4 [&_summary::-webkit-details-marker]:hidden"
              key={item.question}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground">
                {item.question}
                <Plus
                  className="shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45"
                  size={18}
                />
              </summary>
              <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
                {item.answer}
              </p>
            </details>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}

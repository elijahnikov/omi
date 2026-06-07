import { Eyebrow } from "~/components/marketing/eyebrow";
import { Reveal } from "~/components/motion/reveal";

interface FeatureSplitProps {
  body: string;
  eyebrow: string;
  title: string;
  visual: React.ReactNode;
}

export function FeatureSplit({
  eyebrow,
  title,
  body,
  visual,
}: FeatureSplitProps) {
  return (
    <div className="flex flex-col">
      <Reveal className="flex flex-col">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-5 text-balance text-3xl text-display text-foreground">
          {title}
        </h2>
        <p className="mt-4 max-w-md font-medium text-sm text-ui-fg-muted">
          {body}
        </p>
      </Reveal>

      <Reveal className="mt-10 w-full" delay={0.1} y={24}>
        {visual}
      </Reveal>
    </div>
  );
}

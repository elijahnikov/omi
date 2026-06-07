import { captureLogos } from "~/components/marketing/capture-logos";
import { Eyebrow } from "~/components/marketing/eyebrow";

export function CaptureStrip() {
  // Duplicated once for a seamless -50% marquee loop; keys stay unique.
  const items = [
    ...captureLogos.map((l) => ({ ...l, id: `a-${l.name}` })),
    ...captureLogos.map((l) => ({ ...l, id: `b-${l.name}` })),
  ];

  return (
    <section
      aria-label="Capture from everywhere"
      className="border-border border-y bg-background py-8"
    >
      <div className="mx-auto w-full max-w-xl px-5 sm:px-8">
        <div className="mb-6">
          <Eyebrow>Capture from everywhere</Eyebrow>
        </div>
        <div className="marquee-mask relative overflow-hidden">
          <div className="flex w-max animate-marquee items-center motion-reduce:animate-none">
            {items.map((item) => (
              <span
                aria-label={item.name}
                className="mr-10 shrink-0 text-foreground/50"
                key={item.id}
                role="img"
              >
                <item.Logo className="h-6 w-auto" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

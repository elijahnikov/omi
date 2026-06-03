import { AiChatMcp } from "~/components/sections/ai-chat-mcp";
import { ByoKeys } from "~/components/sections/byo-keys";
import { CaptureStrip } from "~/components/sections/capture-strip";
import { Faq } from "~/components/sections/faq";
import { FeatureBento } from "~/components/sections/feature-bento";
import { FinalCta } from "~/components/sections/final-cta";
import { Footer } from "~/components/sections/footer";
import { Hero } from "~/components/sections/hero";
import { Integrations } from "~/components/sections/integrations";
import { Nav } from "~/components/sections/nav";
import { Pricing } from "~/components/sections/pricing";
import { SemanticSearch } from "~/components/sections/semantic-search";
import { SmartConnections } from "~/components/sections/smart-connections";
import { JsonLd } from "~/components/seo/json-ld";

export default function HomePage() {
  return (
    <>
      {/* <Separator
        className="fixed top-0 right-[29%] h-screen opacity-[50%]"
        orientation="vertical"
      />
      <Separator
        className="fixed top-0 left-[29%] h-screen opacity-[50%]"
        orientation="vertical"
      /> */}
      <JsonLd />
      <Nav />
      <main>
        <Hero />
        <CaptureStrip />
        <SemanticSearch />
        <AiChatMcp />
        <SmartConnections />
        <FeatureBento />
        <Integrations />
        <ByoKeys />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}

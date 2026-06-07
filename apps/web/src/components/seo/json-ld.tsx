import { site } from "~/lib/site";

export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: site.name,
        description: site.description,
        url: site.url,
        applicationCategory: "ProductivityApplication",
        operatingSystem: "Web, macOS, iOS",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "Organization",
        name: site.name,
        url: site.url,
        sameAs: ["https://x.com/omi", "https://github.com/omi"],
      },
    ],
  };

  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires raw script content
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      type="application/ld+json"
    />
  );
}

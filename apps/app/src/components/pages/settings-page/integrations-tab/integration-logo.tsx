import { INTEGRATION_LOGO } from "~/components/pages/settings-page/import-tab/integration-logos";
import { McpLogo } from "~/components/pages/user-settings-page/integrations/mcp-logos";
import type { IntegrationCatalogEntry } from "~/lib/integration-catalog";

function logoKeyFor(
  entry: IntegrationCatalogEntry | undefined,
  provider?: string
): string | undefined {
  const providerId = provider ?? entry?.connection?.providerId;
  if (providerId === "notion") {
    return "notion_oauth";
  }
  if (providerId === "github") {
    return "github";
  }
  return entry?.logoKey ?? provider;
}

export function IntegrationLogo({
  entry,
  provider,
  className = "size-5",
}: {
  entry?: IntegrationCatalogEntry;
  provider?: string;
  className?: string;
}) {
  const key = logoKeyFor(entry, provider);
  const Logo = key ? INTEGRATION_LOGO[key] : undefined;

  if (Logo) {
    return (
      <div className="flex shrink-0 items-center justify-center">
        <Logo aria-hidden="true" className={className} />
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center justify-center">
      <McpLogo className={className} logoKey={key ?? "linear"} />
    </div>
  );
}

export const integrationSelectRowClassName =
  "flex w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-ui-bg-component-hover focus-visible:outline-none focus-visible:shadow-borders-interactive-with-active dark:hover:bg-ui-bg-component";

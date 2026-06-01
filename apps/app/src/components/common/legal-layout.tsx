import { Heading } from "@omi/ui/heading";
import { Text } from "@omi/ui/text";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { PageContent } from "./page-content";

interface LegalLayoutProps {
  children: ReactNode;
  lastUpdated: string;
  title: string;
}

export function LegalLayout({
  title,
  lastUpdated,
  children,
}: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-ui-bg-subtle pb-24">
      <header className="flex items-center justify-between px-6 py-5">
        <Link className="flex items-center gap-2" to="/">
          <img
            alt="omi"
            className="hidden rounded-lg dark:block"
            height={36}
            src="/omi_white_on_transparent.png"
            width={36}
          />
          <img
            alt="omi"
            className="rounded-lg dark:hidden"
            height={36}
            src="/omi_black_on_transparent.png"
            width={36}
          />
          <span className="font-semibold text-ui-fg-base">omi</span>
        </Link>
      </header>

      <PageContent className="pt-8" width="xl:w-1/2">
        <Heading className="mb-1" level="h1">
          {title}
        </Heading>
        <Text className="text-ui-fg-muted" size="small">
          Last updated: {lastUpdated}
        </Text>

        <div className="legal-prose txt-medium mt-8 flex flex-col gap-6 text-ui-fg-subtle">
          {children}
        </div>
      </PageContent>
    </div>
  );
}

interface LegalSectionProps {
  children: ReactNode;
  heading: string;
}

export function LegalSection({ heading, children }: LegalSectionProps) {
  return (
    <section className="flex flex-col gap-2">
      <Heading className="text-ui-fg-base" level="h2">
        {heading}
      </Heading>
      {children}
    </section>
  );
}

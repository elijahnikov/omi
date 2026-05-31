import { Text } from "@omi/ui/text";
import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, LegalSection } from "~/components/common/legal-layout";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPolicyComponent,
});

// NOTE: This policy describes omi's real data practices and subprocessors as of
// the date below. It is written to be accurate to the codebase, but it is not a
// substitute for review by counsel. Update the legal entity name, address, and
// governing jurisdiction before launch, and keep the subprocessor list in sync
// as integrations change.
const LAST_UPDATED = "May 31, 2026";
const PRIVACY_EMAIL = "privacy@omi.ac";

const SUBPROCESSORS: {
  name: string;
  purpose: string;
  href: string;
}[] = [
  {
    name: "Convex",
    purpose:
      "Backend platform, database, file storage, and real-time sync. Stores your account data and all content you create.",
    href: "https://www.convex.dev/legal/privacy",
  },
  {
    name: "Stripe",
    purpose:
      "Payment processing and subscription management. Handles your card details directly; we never store them.",
    href: "https://stripe.com/privacy",
  },
  {
    name: "Resend",
    purpose: "Sends transactional email such as sign-in and account notices.",
    href: "https://resend.com/legal/privacy-policy",
  },
  {
    name: "Sentry",
    purpose:
      "Error monitoring and performance diagnostics to keep the Service reliable.",
    href: "https://sentry.io/privacy/",
  },
  {
    name: "OpenAI",
    purpose:
      "Powers AI features (chat, search enrichment, memory). Receives the content you submit to those features.",
    href: "https://openai.com/policies/privacy-policy/",
  },
  {
    name: "Anthropic",
    purpose:
      "Alternative AI model provider for chat and AI features when selected.",
    href: "https://www.anthropic.com/legal/privacy",
  },
  {
    name: "Google",
    purpose:
      "Provides Google sign-in, an alternative AI model (Gemini), and — if you connect it — Google Drive import.",
    href: "https://policies.google.com/privacy",
  },
  {
    name: "Discord",
    purpose: "Provides Discord sign-in if you choose to use it.",
    href: "https://discord.com/privacy",
  },
];

const INTEGRATIONS = [
  "GitHub",
  "Google Drive",
  "Notion",
  "Linear",
  "Raindrop",
  "Readwise",
];

function PrivacyPolicyComponent() {
  return (
    <LegalLayout lastUpdated={LAST_UPDATED} title="Privacy Policy">
      <Text>
        This Privacy Policy explains how omi ("omi", "we", "us", or "our")
        collects, uses, shares, and protects information when you use our
        applications and related services (the "Service"). It applies to the omi
        web app, browser extension, mobile app, and any other product that links
        to this policy. By using the Service you agree to the practices
        described here.
      </Text>

      <LegalSection heading="Information we collect">
        <Text>We collect information in the following ways.</Text>
        <Text className="font-medium text-ui-fg-base">
          Information you provide
        </Text>
        <ul className="ml-5 flex list-disc flex-col gap-1">
          <li>
            <strong>Account details.</strong> When you sign up — directly or
            through Google or Discord — we receive your name, email address, and
            basic profile information.
          </li>
          <li>
            <strong>Content you create.</strong> Resources, notes, files,
            collections, tags, journal entries, chat messages, and any other
            material you add to your workspaces.
          </li>
          <li>
            <strong>Workspace and collaboration data.</strong> Workspaces you
            create or join, members you invite, and shared links you generate.
          </li>
          <li>
            <strong>Support communications.</strong> Messages you send us and
            any information you include in them.
          </li>
        </ul>
        <Text className="font-medium text-ui-fg-base">
          Information from connected services
        </Text>
        <Text>
          When you connect a third-party integration ({INTEGRATIONS.join(", ")}
          ), we store the access tokens you authorize and import the data you
          choose to bring into omi. You can disconnect an integration at any
          time from your settings, which revokes our ongoing access.
        </Text>
        <Text className="font-medium text-ui-fg-base">
          Information collected automatically
        </Text>
        <ul className="ml-5 flex list-disc flex-col gap-1">
          <li>
            <strong>Usage and device data.</strong> Logs, IP address, browser
            and device type, and interactions with the Service.
          </li>
          <li>
            <strong>Diagnostic data.</strong> Crash and performance reports
            captured by our error-monitoring provider to help us fix problems.
          </li>
          <li>
            <strong>Cookies and local storage.</strong> We use cookies and
            similar technologies that are strictly necessary to keep you signed
            in and to operate the Service. We do not use third-party advertising
            cookies.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="How we use your information">
        <Text>We use the information we collect to:</Text>
        <ul className="ml-5 flex list-disc flex-col gap-1">
          <li>provide, maintain, and improve the Service;</li>
          <li>authenticate you and keep your account secure;</li>
          <li>
            power AI features — when you use chat, search enrichment, or memory,
            the relevant content is sent to our AI model providers to generate a
            response;
          </li>
          <li>process payments and manage subscriptions;</li>
          <li>
            send transactional messages such as sign-in and account notices;
          </li>
          <li>respond to your requests and provide support;</li>
          <li>
            monitor performance, detect abuse, and protect the security and
            integrity of the Service; and
          </li>
          <li>comply with legal obligations.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="AI features">
        <Text>
          omi uses third-party large language models to provide AI features.
          When you invoke one of these features, the content needed to fulfil
          your request is transmitted to the applicable model provider (OpenAI,
          Anthropic, or Google) to generate a result. We use these providers
          under terms that prohibit them from using your content to train their
          general models. We do not use your content to train our own models.
        </Text>
      </LegalSection>

      <LegalSection heading="How we share information">
        <Text>
          We do not sell your personal information, and we do not share it for
          cross-context behavioural advertising. We share information only in
          the following circumstances:
        </Text>
        <ul className="ml-5 flex list-disc flex-col gap-1">
          <li>
            <strong>With service providers (subprocessors)</strong> who process
            data on our behalf to operate the Service, listed below.
          </li>
          <li>
            <strong>At your direction</strong> — for example, when you generate
            a public share link or connect an integration.
          </li>
          <li>
            <strong>With other workspace members</strong> who have access to the
            workspaces you participate in.
          </li>
          <li>
            <strong>For legal reasons</strong> — to comply with applicable law,
            enforce our terms, or protect the rights, safety, and security of
            omi, our users, or the public.
          </li>
          <li>
            <strong>In a business transfer</strong> — in connection with a
            merger, acquisition, or sale of assets, subject to this policy.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="Subprocessors">
        <Text>
          We rely on the following trusted providers to operate the Service.
          Each processes data only on our behalf and under contractual
          confidentiality and security obligations.
        </Text>
        <ul className="mt-1 flex flex-col gap-3">
          {SUBPROCESSORS.map((sub) => (
            <li className="flex flex-col gap-0.5" key={sub.name}>
              <a
                className="font-medium text-ui-fg-base underline"
                href={sub.href}
                rel="noopener noreferrer"
                target="_blank"
              >
                {sub.name}
              </a>
              <Text className="text-ui-fg-muted" size="small">
                {sub.purpose}
              </Text>
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection heading="Data retention">
        <Text>
          We retain your information for as long as your account is active or as
          needed to provide the Service. You can delete individual content at
          any time, which moves it to trash and then permanently removes it.
          When you delete your account, we delete or anonymise your personal
          information within a reasonable period, except where we are required
          to retain it to comply with legal obligations, resolve disputes, or
          enforce our agreements.
        </Text>
      </LegalSection>

      <LegalSection heading="Security">
        <Text>
          We use industry-standard technical and organisational measures to
          protect your information, including encryption in transit, scoped
          access controls, and rate limiting. No method of transmission or
          storage is completely secure, so we cannot guarantee absolute
          security. If you believe your account has been compromised, contact us
          immediately.
        </Text>
      </LegalSection>

      <LegalSection heading="International data transfers">
        <Text>
          We and our subprocessors may process and store your information in
          countries other than the one in which you live, including the United
          States. Where required, we rely on appropriate safeguards such as the
          European Commission's Standard Contractual Clauses to protect your
          information when it is transferred internationally.
        </Text>
      </LegalSection>

      <LegalSection heading="Your rights and choices">
        <Text>
          Depending on where you live, you may have the right to access,
          correct, export, delete, or restrict the processing of your personal
          information, and to object to certain processing or withdraw consent.
          You can access and edit most of your data directly in the app, or you
          can contact us to exercise any of these rights. We will not
          discriminate against you for exercising them.
        </Text>
      </LegalSection>

      <LegalSection heading="Children's privacy">
        <Text>
          The Service is not directed to children under 13 (or the minimum age
          required in your jurisdiction), and we do not knowingly collect
          personal information from them. If you believe a child has provided us
          information, contact us and we will delete it.
        </Text>
      </LegalSection>

      <LegalSection heading="Changes to this policy">
        <Text>
          We may update this Privacy Policy from time to time. When we make
          material changes, we will revise the "Last updated" date above and,
          where appropriate, notify you through the Service. Your continued use
          of the Service after the changes take effect constitutes acceptance of
          the updated policy.
        </Text>
      </LegalSection>

      <LegalSection heading="Contact us">
        <Text>
          If you have questions about this Privacy Policy or how we handle your
          information, contact us at{" "}
          <a
            className="text-ui-fg-base underline"
            href={`mailto:${PRIVACY_EMAIL}`}
          >
            {PRIVACY_EMAIL}
          </a>
          .
        </Text>
      </LegalSection>
    </LegalLayout>
  );
}

import { Text } from "@omi/ui/text";
import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, LegalSection } from "~/components/common/legal-layout";

export const Route = createFileRoute("/terms")({
  component: TermsOfServiceComponent,
});

// NOTE: These terms reflect how omi actually operates (subscriptions via Stripe,
// AI features via third-party models, user-connected integrations). They are not
// a substitute for review by counsel. Update the legal entity name, address, and
// governing-law jurisdiction before launch.
const LAST_UPDATED = "May 31, 2026";
const LEGAL_EMAIL = "legal@omi.ac";

function TermsOfServiceComponent() {
  return (
    <LegalLayout lastUpdated={LAST_UPDATED} title="Terms of Service">
      <Text>
        These Terms of Service ("Terms") are a binding agreement between you and
        omi ("omi", "we", "us", or "our") that governs your access to and use of
        our applications and related services (the "Service"). By creating an
        account or using the Service, you agree to these Terms and to our{" "}
        <a className="text-ui-fg-base underline" href="/privacy">
          Privacy Policy
        </a>
        . If you do not agree, do not use the Service.
      </Text>

      <LegalSection heading="Eligibility and accounts">
        <Text>
          You must be at least 13 years old, or the minimum age of digital
          consent in your jurisdiction, to use the Service. You are responsible
          for the accuracy of the information you provide, for keeping your
          account credentials secure, and for all activity that occurs under
          your account. Notify us promptly of any unauthorised use.
        </Text>
      </LegalSection>

      <LegalSection heading="Your content">
        <Text>
          You retain all ownership rights in the content you create, upload, or
          import into omi ("Your Content"). You grant us a worldwide,
          non-exclusive, royalty-free licence to host, store, reproduce,
          process, and display Your Content solely to operate and provide the
          Service to you and the people you share it with. You represent that
          you have the rights necessary to submit Your Content and that it does
          not violate these Terms or any law.
        </Text>
      </LegalSection>

      <LegalSection heading="AI features">
        <Text>
          The Service includes features powered by third-party AI models. When
          you use them, the relevant content is sent to our model providers to
          generate a response, as described in our Privacy Policy. AI output may
          be inaccurate, incomplete, or otherwise unsuitable for your purposes;
          you are responsible for reviewing it before relying on it, and you
          must not use AI features to produce unlawful or infringing material.
        </Text>
      </LegalSection>

      <LegalSection heading="Third-party integrations">
        <Text>
          You may connect third-party services (such as GitHub, Google Drive,
          Notion, Linear, Raindrop, or Readwise) to import or sync data. Your
          use of those services is governed by their own terms, and we are not
          responsible for them. By connecting an integration, you authorise omi
          to access and process data from it on your behalf. You can disconnect
          at any time from your settings.
        </Text>
      </LegalSection>

      <LegalSection heading="Acceptable use">
        <Text>You agree not to:</Text>
        <ul className="ml-5 flex list-disc flex-col gap-1">
          <li>
            use the Service for any unlawful, harmful, or fraudulent purpose;
          </li>
          <li>
            upload content you do not have the right to share, or that infringes
            the intellectual-property or privacy rights of others;
          </li>
          <li>
            upload malware or attempt to gain unauthorised access to, disrupt,
            or compromise the Service or its infrastructure;
          </li>
          <li>
            reverse engineer, scrape, or place unreasonable load on the Service,
            or circumvent rate limits or other protections; or
          </li>
          <li>
            resell or commercially exploit the Service except as expressly
            permitted.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="Subscriptions, billing, and refunds">
        <Text>
          Some features require a paid subscription. Paid plans are billed in
          advance on a recurring basis (monthly or annually, as selected)
          through our payment processor, Stripe. By subscribing, you authorise
          us to charge your payment method for the applicable fees, including
          applicable taxes, until you cancel. Fees are non-refundable except
          where required by law. We may change our prices on prospective notice;
          changes take effect at the start of your next billing period. You can
          cancel at any time, and your plan will remain active through the end
          of the current period.
        </Text>
      </LegalSection>

      <LegalSection heading="Our intellectual property">
        <Text>
          The Service, including its software, design, and branding, is owned by
          omi and protected by intellectual-property laws. These Terms do not
          grant you any right to our trademarks or to the Service except the
          limited right to use it in accordance with these Terms.
        </Text>
      </LegalSection>

      <LegalSection heading="Feedback">
        <Text>
          If you send us suggestions or feedback, you grant us a perpetual,
          irrevocable, royalty-free licence to use it without restriction or
          obligation to you.
        </Text>
      </LegalSection>

      <LegalSection heading="Termination">
        <Text>
          You may stop using the Service and delete your account at any time. We
          may suspend or terminate your access if you breach these Terms, if
          your use poses a risk to the Service or others, or if we are required
          to do so by law. Upon termination, your right to use the Service ends
          and we may delete Your Content, subject to our Privacy Policy.
          Sections that by their nature should survive termination will survive.
        </Text>
      </LegalSection>

      <LegalSection heading="Disclaimers">
        <Text>
          The Service is provided "as is" and "as available" without warranties
          of any kind, whether express, implied, or statutory, including any
          implied warranties of merchantability, fitness for a particular
          purpose, and non-infringement, to the fullest extent permitted by law.
          We do not warrant that the Service will be uninterrupted, error-free,
          or secure, or that AI output will be accurate.
        </Text>
      </LegalSection>

      <LegalSection heading="Limitation of liability">
        <Text>
          To the maximum extent permitted by law, omi and its suppliers will not
          be liable for any indirect, incidental, special, consequential, or
          punitive damages, or for any loss of profits, revenue, data, or
          goodwill, arising out of or relating to your use of the Service. Our
          total liability for any claim relating to the Service will not exceed
          the greater of the amount you paid us in the twelve months before the
          claim or one hundred US dollars (USD 100).
        </Text>
      </LegalSection>

      <LegalSection heading="Indemnification">
        <Text>
          You agree to indemnify and hold omi harmless from any claims, damages,
          and expenses (including reasonable legal fees) arising out of Your
          Content, your use of the Service, or your breach of these Terms.
        </Text>
      </LegalSection>

      <LegalSection heading="Governing law and disputes">
        <Text>
          These Terms are governed by the laws of the jurisdiction in which omi
          is established, without regard to conflict-of-laws principles. You
          agree to resolve any dispute relating to the Service in the courts
          located there, unless applicable law grants you the right to bring a
          claim elsewhere.
        </Text>
      </LegalSection>

      <LegalSection heading="Changes to these terms">
        <Text>
          We may update these Terms from time to time. When we make material
          changes, we will revise the "Last updated" date above and, where
          appropriate, notify you through the Service. Your continued use of the
          Service after the changes take effect constitutes acceptance of the
          revised Terms.
        </Text>
      </LegalSection>

      <LegalSection heading="Contact us">
        <Text>
          If you have questions about these Terms, contact us at{" "}
          <a
            className="text-ui-fg-base underline"
            href={`mailto:${LEGAL_EMAIL}`}
          >
            {LEGAL_EMAIL}
          </a>
          .
        </Text>
      </LegalSection>
    </LegalLayout>
  );
}

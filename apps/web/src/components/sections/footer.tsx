import { Logo } from "~/components/marketing/logo";
import { links } from "~/lib/site";

const columns = [
  {
    title: "Product",
    items: [
      { label: "Features", href: "#features" },
      { label: "Integrations", href: "#integrations" },
      { label: "Pricing", href: "#pricing" },
      { label: "Get started", href: links.register },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Docs", href: links.docs },
      { label: "FAQ", href: "#faq" },
      { label: "Changelog", href: links.docs },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "GitHub", href: links.github },
      { label: "X / Twitter", href: links.twitter },
    ],
  },
];

const currentYear = 2026;

export function Footer() {
  return (
    <footer className="border-border border-t bg-sidebar px-0 pt-14 pb-4 sm:px-0">
      <div className="mx-auto grid w-full max-w-xl grid-cols-2 gap-8 sm:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-ui-fg-subtle text-xs">
            The knowledge base that thinks with you.
          </p>
        </div>

        {columns.map((column) => (
          <nav aria-label={column.title} key={column.title}>
            <h2 className="font-medium text-foreground text-sm">
              {column.title}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {column.items.map((item) => {
                const external = item.href.startsWith("http");
                return (
                  <li key={item.label}>
                    <a
                      className="font-medium text-sm text-ui-fg-muted transition-colors hover:text-foreground"
                      href={item.href}
                      rel={external ? "noopener" : undefined}
                      target={external ? "_blank" : undefined}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mx-auto mt-12 w-full max-w-xl -px-8 pt-8">
        <p className="font-medium text-muted-foreground text-xs">
          © {currentYear} Omi · built for thinkers
        </p>
      </div>
    </footer>
  );
}

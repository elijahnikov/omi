"use client";

import { Button } from "@omi/ui/button";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { links } from "~/lib/site";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Integrations", href: "#integrations" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Nav() {
  const [_scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={
        "sticky top-0 z-50 mt-6 bg-ui-bg-subtle transition-colors duration-200"
      }
    >
      <nav aria-label="Primary" className="px-5 sm:px-8">
        <div className="mx-auto flex h-16 w-full max-w-xl items-center justify-between">
          <a aria-label="Omi home" className="flex items-center" href="#top">
            <Image
              alt="Omi"
              className="size-9"
              height={36}
              priority
              src="/omi_black_on_transparent.png"
              width={36}
            />
          </a>

          <div className="flex items-center gap-x-4">
            <ul className="hidden items-center gap-8 md:flex">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    className="font-medium text-[13px] text-ui-fg-subtle transition-colors hover:text-foreground"
                    href={link.href}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="hidden items-center gap-2 md:flex">
              <Button
                className="rounded-full"
                render={<a href={links.login}>Sign in</a>}
                size="base"
              />
            </div>
          </div>

          <button
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex size-9 items-center justify-center rounded-md text-foreground md:hidden"
            onClick={() => setOpen((v) => !v)}
            type="button"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-border border-t bg-background md:hidden">
          <ul className="flex flex-col gap-1 px-5 py-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  className="block rounded-md px-2 py-2.5 text-foreground text-sm hover:bg-accent"
                  href={link.href}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="mt-2">
              <Button
                className="w-full"
                render={<a href={links.login}>Sign in</a>}
                variant="outline"
              />
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  );
}

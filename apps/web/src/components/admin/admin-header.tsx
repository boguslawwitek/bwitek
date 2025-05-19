"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ModeToggle } from "@/components/admin/mode-toggle";
import UserMenu from "@/components/admin/user-menu";
import { LanguageToggle } from "@/components/admin/language-toggle";

export default function AdminHeader() {
  const t = useTranslations();
  const links = [
    { to: "/", label: t('navigation.home') },
  ];

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => {
            return (
              <Link key={to} href={to}>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
      <hr />
    </div>
  );
}

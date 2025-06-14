"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ModeToggle } from "@/components/admin/mode-toggle";
import UserMenu from "@/components/admin/user-menu";
import { LanguageToggle } from "@/components/admin/language-toggle";
import { Icon } from "@/components/icon";

export default function AdminHeader() {
  const t = useTranslations();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center m-auto px-2">
        <div className="flex flex-1 items-center justify-between">
          <Link 
            href="/"
            className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground/80"
          >
            <Icon name="House" provider="lu" className="h-5 w-5" />
            <span className="hidden sm:inline">{t('components.navigation.home')}</span>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ModeToggle />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}

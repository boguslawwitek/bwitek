"use client";
import { cn } from "@/lib/utils";
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { Card, CardContent } from "@/components/ui/card";

const navItems = [
  {
    path: "/admin",
    labelKey: "dashboard.nav.homepage",
  },
  {
    path: "/admin/blog",
    labelKey: "dashboard.nav.blog",
  },
  {
    path: "/admin/blog/comments",
    labelKey: "admin.comments.title",
  },
  {
    path: "/admin/projects",
    labelKey: "dashboard.nav.projects",
  },
  {
    path: "/admin/skills",
    labelKey: "dashboard.nav.skills",
  },
  {
    path: "/admin/contact",
    labelKey: "dashboard.nav.contact",
  },
  {
    path: "/admin/navigation",
    labelKey: "dashboard.nav.navigation",
  },
];

export default function AdminNav() {
  const t = useTranslations();
  const pathname = usePathname();

  return (
    <nav className="w-full sticky top-4">
      <Card>
        <CardContent className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "block w-full rounded-lg px-4 py-2 text-left text-sm font-medium transition-colors",
                pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              )}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </CardContent>
      </Card>
    </nav>
  );
}
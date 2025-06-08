"use client";
import { cn } from "@/lib/utils";
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/icon";

interface AdminNavProps {
  onNavItemClick?: () => void;
  isMobile?: boolean;
}

const navItems = [
  {
    path: "/admin",
    labelKey: "dashboard.nav.homepage",
    icon: "House"
  },
  {
    path: "/admin/blog",
    labelKey: "dashboard.nav.blog",
    icon: "FileText"
  },
  {
    path: "/admin/blog/comments",
    labelKey: "admin.comments.title",
    icon: "MessageSquare"
  },
  {
    path: "/admin/projects",
    labelKey: "dashboard.nav.projects",
    icon: "Briefcase"
  },
  {
    path: "/admin/skills",
    labelKey: "dashboard.nav.skills",
    icon: "Award"
  },
  {
    path: "/admin/contact",
    labelKey: "dashboard.nav.contact",
    icon: "Mail"
  },
  {
    path: "/admin/privacy-policy",
    labelKey: "dashboard.nav.privacyPolicy",
    icon: "Shield"
  },
  {
    path: "/admin/navigation",
    labelKey: "dashboard.nav.navigation",
    icon: "Menu"
  },
  {
    path: "/admin/newsletter",
    labelKey: "dashboard.nav.newsletter",
    icon: "Send"
  },
];

export default function AdminNav({ onNavItemClick, isMobile = false }: AdminNavProps) {
  const t = useTranslations();
  const pathname = usePathname();

  const handleClick = () => {
    if (onNavItemClick) {
      onNavItemClick();
    }
  };

  const NavLinks = () => (
    <div className={cn("space-y-2", isMobile && "p-4 pt-14")}>
      {navItems.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          onClick={handleClick}
          className={cn(
            "block w-full rounded-lg px-4 py-2 text-left text-sm font-medium transition-colors",
            "flex items-center gap-3",
            pathname === item.path
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          )}
        >
          <Icon name={item.icon} provider="lu" className="h-4 w-4" />
          {t(item.labelKey)}
        </Link>
      ))}
    </div>
  );

  if (isMobile) {
    return <NavLinks />;
  }

  return (
    <nav className="w-full sticky top-4">
      <Card>
        <CardContent className="p-4">
          <NavLinks />
        </CardContent>
      </Card>
    </nav>
  );
}
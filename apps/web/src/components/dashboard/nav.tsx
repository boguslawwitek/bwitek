import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";

const navItems = [
  {
    path: "/admin/homepage",
    labelKey: "dashboard.nav.homepage",
  },
  {
    path: "/admin/skills",
    labelKey: "dashboard.nav.skills",
  },
  {
    path: "/admin/projects",
    labelKey: "dashboard.nav.projects",
  },
  {
    path: "/admin/navigation",
    labelKey: "dashboard.nav.navigation",
  },
  {
    path: "/admin/contact",
    labelKey: "dashboard.nav.contact",
  },
];

export function DashboardNav() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="w-full sticky top-4">
      <Card>
        <CardContent className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "block w-full rounded-lg px-4 py-2 text-left text-sm font-medium transition-colors",
                location.pathname === item.path
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

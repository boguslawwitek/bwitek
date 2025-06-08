"use client"
import AdminHeader from "@/components/admin/admin-header";
import AdminNav from "@/components/admin/admin-nav";
import { authClient } from "@/lib/auth-client";
import {useTranslations} from 'next-intl';
import {useRouter} from '@/i18n/navigation';
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icon";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const t = useTranslations();
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    useEffect(() => {
        if (!session && !isPending) {
          router.push("/login");
        }
    }, [session, isPending]);
    
    if (isPending) {
        return <div>{t("common.loading")}</div>;
    }

    return (
        <div className="min-h-screen bg-muted/10 grid grid-rows-[auto_1fr]">
            <AdminHeader />
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between gap-4">
                        <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
                        <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon" className="lg:hidden">
                                    <Icon name="Menu" provider="lu" className="h-5 w-5" />
                                    <span className="sr-only">{t("navigation.menu")}</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[280px] p-0">
                                <SheetTitle className="sr-only">
                                    {t("navigation.menu")}
                                </SheetTitle>
                                <AdminNav onNavItemClick={() => setIsMobileNavOpen(false)} isMobile />
                            </SheetContent>
                        </Sheet>
                    </div>
                    <p className="text-muted-foreground">
                        {t("dashboard.welcomeUser", { name: session?.user.name || "" })}
                    </p>
                </div>
    
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <AdminNav />
                    </div>
                    <main className="flex-1 min-w-0 max-w-full overflow-x-auto">
                        <div className="max-w-6xl">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

"use client"
import AdminHeader from "@/components/admin/admin-header";
import AdminNav from "@/components/admin/admin-nav";
import { authClient } from "@/lib/auth-client";
import {useTranslations} from 'next-intl';
import {useRouter} from '@/i18n/navigation';
import { useEffect } from "react";
export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const t = useTranslations();
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

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
                <h1 className="text-2xl font-bold">{t("dashboard.title")}</h1>
                <p className="text-muted-foreground">
                {t("dashboard.welcomeUser", { name: session?.user.name || "" })}
                </p>
            </div>
    
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="w-full lg:w-64 flex-shrink-0">
                <AdminNav />
                </div>
                <main className="flex-1 min-w-0 max-w-full overflow-hidden">
                <div className="max-w-6xl">
                {children}
                </div>
                </main>
            </div>
            </div>
        </div>
    );
}

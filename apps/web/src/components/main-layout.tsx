import type { ReactNode } from "react";
import TopBar from "@/components/top-bar";
import NavigationBar from "@/components/navigation-bar";
import Footer from "@/components/footer";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-svh flex flex-col">
      <TopBar />
      <NavigationBar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
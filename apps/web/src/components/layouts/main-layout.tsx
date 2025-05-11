import type { ReactNode } from "react";
import TopBar from "../top-bar";
import NavigationBar from "../navigation-bar";
import Footer from "../footer";

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

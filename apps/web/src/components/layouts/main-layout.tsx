import { Outlet } from "@tanstack/react-router";
import TopBar from "../top-bar";

export default function MainLayout() {
  return (
    <div className="min-h-svh flex flex-col">
      <TopBar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

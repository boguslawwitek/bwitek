import { Outlet } from "@tanstack/react-router";

export default function DashboardLayout() {
  return (
    <div className="min-h-svh">
      <main>
        <Outlet />
      </main>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import MainLayout from "@/components/layouts/main-layout";

export const Route = createFileRoute("/")({
  component: MainLayout,
});

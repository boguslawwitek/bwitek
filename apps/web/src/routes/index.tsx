import { createFileRoute } from "@tanstack/react-router";
import HomePage from "@/components/homepage";
import MainLayout from "@/components/layouts/main-layout";

export const Route = createFileRoute("/")({  
  component: IndexPage,
});

function IndexPage() {
  return (
    <MainLayout>
      <HomePage />
    </MainLayout>
  );
}

import SignInForm from "@/components/dashboard/sign-in-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return <SignInForm onSwitchToSignUp={() => {}} />;
}

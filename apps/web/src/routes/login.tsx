import SignInForm from "@/components/dashboard/sign-in-form";
import SignUpForm from "@/components/dashboard/sign-up-form";
import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const registrationStatus = useQuery(trpc.getRegistrationStatus.queryOptions());
  const [isRegistering, setIsRegistering] = useState(false);

  console.log(registrationStatus.data);

  useEffect(() => {
    if (!registrationStatus.data?.enabled && isRegistering) {
      setIsRegistering(false);
    }
  }, [registrationStatus.data?.enabled, isRegistering]);

  if (!registrationStatus.data) {
    return null;
  }

  if (!registrationStatus.data?.enabled) {
    return <SignInForm />;
  }

  return isRegistering ? (
    <SignUpForm onSwitchToSignIn={() => setIsRegistering(false)} />
  ) : (
    <SignInForm onSwitchToSignUp={() => setIsRegistering(true)} />
  );
}

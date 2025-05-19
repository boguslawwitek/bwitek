"use client"

import { useEffect } from "react";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import MainLayout from "@/components/main-layout";

export default function LoginPage() {
  const registrationStatus = useQuery(trpc.getRegistrationStatus.queryOptions());
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (!registrationStatus.data?.enabled && isRegistering) {
      setIsRegistering(false);
    }
  }, [registrationStatus.data?.enabled, isRegistering]);

  if (!registrationStatus.data) {
    return null;
  }

  if (!registrationStatus.data?.enabled) {
    return (
      <MainLayout>
        <SignInForm disabledRegistration={true} />
      </MainLayout>
    );
  }

  return isRegistering ? (
    <MainLayout>
      <SignUpForm onSwitchToSignIn={() => setIsRegistering(false)} />
    </MainLayout>
  ) : (
    <MainLayout>
      <SignInForm onSwitchToSignUp={() => setIsRegistering(true)} />
    </MainLayout>
  );
}

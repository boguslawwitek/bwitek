"use client"

import { useEffect } from "react";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import MainLayout from "@/components/main-layout";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const registrationStatus = useQuery(trpc.getRegistrationStatus.queryOptions());
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();
  
  const authStatus = useQuery(trpc.checkAuthStatus.queryOptions());

  useEffect(() => {
    if (authStatus.data?.isLoggedIn) {
      router.push("/admin");
    }
  }, [authStatus.data, router]);

  useEffect(() => {
    if (!registrationStatus.data?.enabled && isRegistering) {
      setIsRegistering(false);
    }
  }, [registrationStatus.data?.enabled, isRegistering]);

  if (!registrationStatus.data || authStatus.isLoading) {
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

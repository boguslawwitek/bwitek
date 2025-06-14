import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { TurnstileWrapper, type TurnstileRef } from "@/components/turnstile";
import {useRouter} from '@/i18n/navigation';
import { useTranslations } from "next-intl";
import { useState, useRef } from "react";

export default function SignUpForm({
  onSwitchToSignIn,
}: {
  onSwitchToSignIn: () => void;
}) {
  const t = useTranslations();
  const router = useRouter();
  const { isPending } = authClient.useSession();
  const turnstileRef = useRef<TurnstileRef>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileError, setTurnstileError] = useState("");

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      if (!turnstileToken) {
        setTurnstileError(t('components.validation.turnstileRequired'));
        return;
      }

      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: () => {
            router.push("/admin");
            toast.success(t('pages.register.success'));
          },
          onError: (error) => {
            toast.error(error.error.message);
            turnstileRef.current?.reset();
            setTurnstileToken("");
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  const handleTurnstileVerify = (token: string) => {
    setTurnstileToken(token);
    setTurnstileError("");
  };

  const handleTurnstileError = () => {
    setTurnstileToken("");
    setTurnstileError(t('components.validation.turnstileRequired'));
  };

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="mx-auto w-full mt-10 max-w-md p-6">
      <h1 className="mb-6 text-center text-3xl font-bold">{t('pages.register.title')}</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className="space-y-4"
      >
        <div>
          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>{t('pages.register.name')}</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>{t('pages.login.email')}</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>{t('pages.login.password')}</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <div className="space-y-2">
          <TurnstileWrapper
            ref={turnstileRef}
            onVerify={handleTurnstileVerify}
            onError={handleTurnstileError}
            onExpire={handleTurnstileError}
          />
          {turnstileError && (
            <p className="text-sm text-red-500">{turnstileError}</p>
          )}
        </div>

        <form.Subscribe>
          {(state) => (
            <Button
              type="submit"
              className="w-full"
              disabled={!state.canSubmit || state.isSubmitting}
            >
              {state.isSubmitting ? t('common.submitting') : t('pages.register.submit')}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">{t('pages.register.haveAccount')}</p>
        <Button
          variant="link"
          onClick={onSwitchToSignIn}
          className="text-indigo-600 hover:text-indigo-800"
        >
          {t('pages.register.signIn')}
        </Button>
      </div>
    </div>
  );
}

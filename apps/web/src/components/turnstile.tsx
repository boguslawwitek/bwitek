"use client";

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { useTheme } from "next-themes";

export interface TurnstileRef {
  reset: () => void;
}

interface TurnstileWrapperProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  onBeforeInteractive?: () => void;
  onAfterInteractive?: () => void;
  onUnsupported?: () => void;
}

export const TurnstileWrapper = forwardRef<TurnstileRef, TurnstileWrapperProps>(
  ({ onVerify, onError, onExpire, onBeforeInteractive, onAfterInteractive, onUnsupported }, ref) => {
    const turnstileRef = useRef<TurnstileInstance>(null);
    const { theme, resolvedTheme } = useTheme();

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (turnstileRef.current) {
          turnstileRef.current.reset();
        }
      },
    }));

    if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      console.warn("NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set");
      return null;
    }

    // Determine the appropriate theme for Turnstile
    // If theme is "system", use resolvedTheme, otherwise use the selected theme
    const turnstileTheme = (() => {
      if (theme === "system") {
        return resolvedTheme === "dark" ? "dark" : "light";
      }
      return theme === "dark" ? "dark" : "light";
    })();

    return (
      <Turnstile
        ref={turnstileRef}
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
        onSuccess={onVerify}
        onError={onError}
        onExpire={onExpire}
        onBeforeInteractive={onBeforeInteractive}
        onAfterInteractive={onAfterInteractive}
        onUnsupported={onUnsupported}
        options={{
          theme: turnstileTheme,
          size: "normal",
        }}
      />
    );
  }
);

TurnstileWrapper.displayName = "TurnstileWrapper";
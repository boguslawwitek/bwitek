import { z } from "zod";
import { publicProcedure, router } from "../lib/trpc";
import { emailService } from "../services/email";
import { verifyTurnstileToken } from "../lib/turnstile";
import { TRPCError } from "@trpc/server";

const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  message: z.string().min(10, "Message must be at least 10 characters long"),
  turnstileToken: z.string().min(1, "Turnstile verification is required"),
});

export const mailRouter = router({
  sendContactForm: publicProcedure
    .input(contactFormSchema)
    .mutation(async ({ input }) => {
      // Verify Turnstile token
      const isValidToken = await verifyTurnstileToken(input.turnstileToken);
      if (!isValidToken) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid Turnstile verification",
        });
      }

      // Remove turnstileToken from input before sending to email service
      const { turnstileToken, ...emailData } = input;
      return emailService.sendContactForm(emailData);
    }),
}); 
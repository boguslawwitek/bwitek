import { z } from "zod";
import { publicProcedure, router } from "../lib/trpc";
import { emailService } from "../services/email";

const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  message: z.string().min(10, "Message must be at least 10 characters long"),
});

export const mailRouter = router({
  sendContactForm: publicProcedure
    .input(contactFormSchema)
    .mutation(async ({ input }) => {
      return emailService.sendContactForm(input);
    }),

  // testSmtpConnection: publicProcedure
  //   .query(async () => {
  //     return emailService.testConnection();
  //   }),
}); 
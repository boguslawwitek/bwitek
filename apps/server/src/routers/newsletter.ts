import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../lib/trpc";
import { senderService } from "../services/brevo";
import { TRPCError } from "@trpc/server";
import { db } from "../db";
import { blogPosts } from "../db/schema/blog";
import { eq } from "drizzle-orm";

const subscribeSchema = z.object({
  email: z.string().email("Valid email is required"),
  language: z.enum(['pl', 'en']),
  gdprConsent: z.boolean().refine(val => val === true, "GDPR consent is required"),
  source: z.enum(['blog', 'article', 'manual']).optional(),
});

const confirmSubscriptionSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

const unsubscribeWithFeedbackSchema = z.object({
  email: z.string().email("Valid email is required"),
  reason: z.enum(['too_frequent', 'not_relevant', 'never_subscribed', 'poor_content', 'technical_issues', 'other']),
  feedback: z.string().optional(),
  language: z.enum(['pl', 'en']),
});

const sendNewsletterSchema = z.object({
  articleId: z.string().min(1, "Article ID is required"),
  language: z.enum(['pl', 'en']),
});

const cleanupSubscriberSchema = z.object({
  email: z.string().email("Valid email is required"),
  targetLanguage: z.enum(['pl', 'en']),
});

export const newsletterRouter = router({
  // Subscribe to newsletter (now with double opt-in)
  subscribe: publicProcedure
    .input(subscribeSchema)
    .mutation(async ({ input }) => {
      try {
        // Request subscription with double opt-in
        const result = await senderService.requestSubscription({
          email: input.email,
          language: input.language,
          source: input.source || 'manual',
        });

        return {
          success: true,
          message: input.language === 'pl' 
            ? 'Sprawdź swoją skrzynkę email i kliknij link potwierdzający, aby zakończyć subskrypcję.'
            : 'Please check your email and click the confirmation link to complete your subscription.',
          data: { token: result.token }
        };
      } catch (error) {
        console.error('Newsletter subscription request error:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: input.language === 'pl' 
            ? 'Wystąpił błąd podczas zapisywania do newslettera'
            : 'An error occurred during newsletter subscription',
        });
      }
    }),

  // Confirm subscription with token
  confirmSubscription: publicProcedure
    .input(confirmSubscriptionSchema)
    .mutation(async ({ input }) => {
      try {
        const result = await senderService.confirmSubscription(input.token);

        return {
          success: true,
          message: result.language === 'pl'
            ? 'Subskrypcja została pomyślnie potwierdzona! Dziękujemy za dołączenie do newslettera BWitek.dev.'
            : 'Your subscription has been successfully confirmed! Thank you for joining the BWitek.dev newsletter.',
          data: result
        };
      } catch (error) {
        console.error('Newsletter confirmation error:', error);
        const message = error instanceof Error && error.message.includes('expired')
          ? 'Link potwierdzający wygasł. Spróbuj zapisać się ponownie.'
          : 'Nieprawidłowy lub wygasły link potwierdzający.';
        
        throw new TRPCError({
          code: "BAD_REQUEST",
          message,
        });
      }
    }),

  // Unsubscribe from newsletter with feedback
  unsubscribeWithFeedback: publicProcedure
    .input(unsubscribeWithFeedbackSchema)
    .mutation(async ({ input }) => {
      try {
        // Save feedback first
        await senderService.saveUnsubscribeFeedback({
          email: input.email,
          reason: input.reason,
          feedback: input.feedback,
          language: input.language,
        });

        // Then unsubscribe from Brevo
        await senderService.unsubscribe(input.email);

        return {
          success: true,
          message: input.language === 'pl'
            ? 'Zostałeś pomyślnie wypisany z newslettera. Dziękujemy za opinię!'
            : 'You have been successfully unsubscribed from the newsletter. Thank you for your feedback!',
        };
      } catch (error) {
        console.error('Newsletter unsubscribe with feedback error:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: input.language === 'pl'
            ? 'Wystąpił błąd podczas wypisywania z newslettera'
            : 'An error occurred while unsubscribing from the newsletter',
        });
      }
    }),

  // Get newsletter statistics
  getStats: protectedProcedure
    .query(async () => {
      try {
        const stats = await senderService.getSubscriberStats();
        return stats;
      } catch (error) {
        console.error('Error fetching newsletter stats:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch newsletter statistics",
        });
      }
    }),

  // Send newsletter to subscribers
  sendNewsletter: protectedProcedure
    .input(sendNewsletterSchema)
    .mutation(async ({ input }) => {
      try {
        // Get article data from blog service
        const article = await db.select().from(blogPosts).where(eq(blogPosts.id, input.articleId)).limit(1);

        if (!article[0]) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Article not found",
          });
        }

        const post = article[0];
        if (!post.isPublished) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot send newsletter for unpublished article",
          });
        }

        // Parse title if it's a string
        const title = typeof post.title === 'string' ? JSON.parse(post.title) : post.title;
        const articleTitle = title?.[input.language] || title?.pl || title?.en || 'Untitled';

        // Parse excerpt if available
        const excerpt = typeof post.excerpt === 'string' ? JSON.parse(post.excerpt) : post.excerpt;
        const articleExcerpt = excerpt?.[input.language] || excerpt?.pl || excerpt?.en;

        // Send newsletter via Brevo
        const result = await senderService.sendNewsletter({
          articleId: input.articleId,
          articleTitle,
          articleSlug: post.slug,
          articleExcerpt,
          articleOgImage: post.ogImage || undefined,
          language: input.language,
        });

        console.log(`Newsletter sent: ${result.recipientCount} emails`);

        return {
          success: true,
          message: input.language,
          recipientCount: result.recipientCount,
          language: input.language,
        };
      } catch (error) {
        console.error('Newsletter send error:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send newsletter",
        });
      }
    }),

  // Legacy unsubscribe (keep for backward compatibility)
  unsubscribe: publicProcedure
    .input(z.object({
      email: z.string().email(),
      token: z.string().optional(), // For secure unsubscribe links
    }))
    .mutation(async ({ input }) => {
      try {
        const result = await senderService.unsubscribe(input.email);

        return {
          success: true,
          message: 'Successfully unsubscribed from newsletter',
        };
      } catch (error) {
        console.error('Newsletter unsubscribe error:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to unsubscribe from newsletter",
        });
      }
    }),

  // Cleanup subscriber
  cleanupSubscriber: publicProcedure
    .input(cleanupSubscriberSchema)
    .mutation(async ({ input }) => {
      try {
        await senderService.cleanupAndFixSubscriber(input.email, input.targetLanguage);

        return {
          success: true,
          message: 'Subscriber cleanup completed successfully',
        };
      } catch (error) {
        console.error('Newsletter cleanup error:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to cleanup subscriber",
        });
      }
    }),
}); 
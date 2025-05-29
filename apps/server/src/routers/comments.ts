import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../lib/trpc";
import { db } from "../db";
import { blogComments, blogPosts } from "../db/schema/blog";
import { eq, and, isNull, desc, asc, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { emailService } from "../services/email";
import { verifyTurnstileToken } from "../lib/turnstile";
import { TRPCError } from "@trpc/server";

const createCommentSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
  parentId: z.string().min(1).optional(),
  authorName: z.string().min(1, "Name is required").max(100),
  authorEmail: z.string().email("Valid email is required").max(255),
  authorWebsite: z.string().url().optional().or(z.literal("")),
  content: z.string().min(1, "Content is required").max(2000),
  turnstileToken: z.string().min(1, "Turnstile verification is required"),
});

const updateCommentStatusSchema = z.object({
  commentId: z.string().min(1, "Comment ID is required"),
  isApproved: z.boolean(),
});

export const commentsRouter = router({
  getApprovedComments: publicProcedure
    .input(z.object({ postId: z.string().min(1, "Post ID is required") }))
    .query(async ({ input }) => {
      const comments = await db
        .select()
        .from(blogComments)
        .where(
          and(
            eq(blogComments.postId, input.postId),
            eq(blogComments.isApproved, true)
          )
        )
        .orderBy(asc(blogComments.createdAt));

      const commentMap = new Map();
      const rootComments: any[] = [];

      comments.forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] });
      });

      comments.forEach(comment => {
        if (comment.parentId) {
          const parent = commentMap.get(comment.parentId);
          if (parent) {
            parent.replies.push(commentMap.get(comment.id));
          }
        } else {
          rootComments.push(commentMap.get(comment.id));
        }
      });

      return rootComments;
    }),

  createComment: publicProcedure
    .input(createCommentSchema)
    .mutation(async ({ input }) => {
      // Verify Turnstile token
      const isValidToken = await verifyTurnstileToken(input.turnstileToken);
      if (!isValidToken) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid Turnstile verification",
        });
      }

      const post = await db
        .select({
          id: blogPosts.id,
          title: blogPosts.title,
          slug: blogPosts.slug,
        })
        .from(blogPosts)
        .where(eq(blogPosts.id, input.postId))
        .limit(1);

      if (!post.length) {
        throw new Error("Post not found");
      }

      const commentId = uuidv4();
      const newComment = {
        id: commentId,
        postId: input.postId,
        parentId: input.parentId || null,
        authorName: input.authorName,
        authorEmail: input.authorEmail,
        authorWebsite: input.authorWebsite || null,
        content: input.content,
        isApproved: false,
        ipAddress: 'unknown',
        userAgent: 'unknown',
      };

      await db.insert(blogComments).values(newComment);

      try {
        let postTitle = 'Bez tytułu';
        
        let titleObj: any = post[0].title;
        if (typeof post[0].title === 'string') {
          try {
            titleObj = JSON.parse(post[0].title);
          } catch (e) {
            console.error('Failed to parse post title JSON:', e);
            titleObj = null;
          }
        }
        
        if (typeof titleObj === 'object' && titleObj !== null) {
          postTitle = titleObj.pl || titleObj.en || 'Bez tytułu';
        } else if (typeof titleObj === 'string') {
          postTitle = titleObj;
        }
        
        const postUrl = `${process.env.BETTER_AUTH_URL}/pl/blog/${post[0].slug}`;
        const adminUrl = `${process.env.BETTER_AUTH_URL}/pl/admin/blog/comments`;

        await emailService.sendNewCommentNotification({
          postTitle,
          postUrl,
          authorName: input.authorName,
          authorEmail: input.authorEmail,
          authorWebsite: input.authorWebsite,
          content: input.content,
          createdAt: new Date().toLocaleString('pl-PL'),
          adminUrl,
        });
      } catch (emailError) {
        console.error('Failed to send comment notification email:', emailError);
      }

      return {
        success: true,
        message: "Comment submitted successfully. It will be visible after approval.",
        commentId,
      };
    }),

  getAllComments: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
      status: z.enum(['all', 'pending', 'approved']).default('all'),
    }))
    .query(async ({ input }) => {
      const offset = (input.page - 1) * input.limit;
      
      let whereCondition;
      if (input.status === 'pending') {
        whereCondition = eq(blogComments.isApproved, false);
      } else if (input.status === 'approved') {
        whereCondition = eq(blogComments.isApproved, true);
      }

      const comments = await db
        .select({
          id: blogComments.id,
          postId: blogComments.postId,
          parentId: blogComments.parentId,
          authorName: blogComments.authorName,
          authorEmail: blogComments.authorEmail,
          authorWebsite: blogComments.authorWebsite,
          content: blogComments.content,
          isApproved: blogComments.isApproved,
          ipAddress: blogComments.ipAddress,
          createdAt: blogComments.createdAt,
          postTitle: blogPosts.title,
          postSlug: blogPosts.slug,
        })
        .from(blogComments)
        .innerJoin(blogPosts, eq(blogComments.postId, blogPosts.id))
        .where(whereCondition)
        .orderBy(desc(blogComments.createdAt))
        .limit(input.limit)
        .offset(offset);

      const parentCommentIds = comments
        .filter(comment => comment.parentId)
        .map(comment => comment.parentId!);

      let parentComments: Array<{
        id: string;
        authorName: string;
        content: string;
      }> = [];
      if (parentCommentIds.length > 0) {
        parentComments = await db
          .select({
            id: blogComments.id,
            authorName: blogComments.authorName,
            content: blogComments.content,
          })
          .from(blogComments)
          .where(inArray(blogComments.id, parentCommentIds));
      }

      const processedComments = comments.map(comment => {
        const parentComment = comment.parentId 
          ? parentComments.find(p => p.id === comment.parentId)
          : null;

        return {
          ...comment,
          postTitle: typeof comment.postTitle === 'string' 
            ? JSON.parse(comment.postTitle) 
            : comment.postTitle,
          parentComment: parentComment ? {
            id: parentComment.id,
            authorName: parentComment.authorName,
            content: parentComment.content.substring(0, 100) + (parentComment.content.length > 100 ? '...' : '')
          } : null
        };
      });

      const totalResult = await db
        .select({ count: blogComments.id })
        .from(blogComments)
        .innerJoin(blogPosts, eq(blogComments.postId, blogPosts.id))
        .where(whereCondition);

      return {
        comments: processedComments,
        total: totalResult.length,
        page: input.page,
        limit: input.limit,
        totalPages: Math.ceil(totalResult.length / input.limit),
      };
    }),

  updateCommentStatus: protectedProcedure
    .input(updateCommentStatusSchema)
    .mutation(async ({ input }) => {
      await db
        .update(blogComments)
        .set({ 
          isApproved: input.isApproved,
          updatedAt: new Date(),
        })
        .where(eq(blogComments.id, input.commentId));

      return {
        success: true,
        message: input.isApproved ? "Comment approved" : "Comment rejected",
      };
    }),

  deleteComment: protectedProcedure
    .input(z.object({ commentId: z.string().min(1, "Comment ID is required") }))
    .mutation(async ({ input }) => {
      await db
        .delete(blogComments)
        .where(eq(blogComments.id, input.commentId));

      return {
        success: true,
        message: "Comment deleted successfully",
      };
    }),

  getCommentsStats: protectedProcedure
    .query(async () => {
      const [pending, approved, total] = await Promise.all([
        db.select({ count: blogComments.id })
          .from(blogComments)
          .innerJoin(blogPosts, eq(blogComments.postId, blogPosts.id))
          .where(eq(blogComments.isApproved, false)),
        db.select({ count: blogComments.id })
          .from(blogComments)
          .innerJoin(blogPosts, eq(blogComments.postId, blogPosts.id))
          .where(eq(blogComments.isApproved, true)),
        db.select({ count: blogComments.id })
          .from(blogComments)
          .innerJoin(blogPosts, eq(blogComments.postId, blogPosts.id)),
      ]);

      return {
        pending: pending.length,
        approved: approved.length,
        total: total.length,
      };
    }),
}); 
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { db } from "../db";
import { blogPosts, blogCategories, blogAttachments } from "../db/schema/blog";
import { blogPageMeta } from "../db/schema/content";
import { eq, sql, desc, and, isNull, isNotNull, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";

const translationSchema = z.object({
  pl: z.string(),
  en: z.string(),
});

const metaTagsSchema = z.object({
  metaTitle: translationSchema.optional(),
  metaDescription: translationSchema.optional(),
  metaKeywords: translationSchema.optional(),
  ogImage: z.string().optional(),
});

export const blogRouter = router({
  // Blog Page Meta
  getBlogPageMeta: publicProcedure.query(async () => {
    const result = await db.select().from(blogPageMeta).limit(1);
    if (!result[0]) return null;
    
    const data = result[0];
    return {
      ...data,
      metaTitle: typeof data.metaTitle === 'string' ? JSON.parse(data.metaTitle) : data.metaTitle,
      metaDescription: typeof data.metaDescription === 'string' ? JSON.parse(data.metaDescription) : data.metaDescription,
      metaKeywords: typeof data.metaKeywords === 'string' ? JSON.parse(data.metaKeywords) : data.metaKeywords,
    };
  }),
  updateBlogPageMeta: protectedProcedure
    .input(metaTagsSchema)
    .mutation(async ({ input }) => {
      const existing = await db.select().from(blogPageMeta).limit(1);
      if (existing.length === 0) {
        return db.insert(blogPageMeta).values({
          id: nanoid(),
          ...input,
        });
      }
      return db.update(blogPageMeta)
        .set(input)
        .where(eq(blogPageMeta.id, existing[0].id));
    }),

  // Blog Categories
  getBlogCategories: publicProcedure.query(async () => {
    const results = await db.select().from(blogCategories).orderBy(blogCategories.order);
    return results.map(category => ({
      ...category,
      name: typeof category.name === 'string' ? JSON.parse(category.name) : category.name,
      description: typeof category.description === 'string' ? JSON.parse(category.description) : category.description,
    }));
  }),

  createBlogCategory: protectedProcedure
    .input(z.object({
      name: translationSchema,
      slug: z.string(),
      description: translationSchema.optional(),
      iconName: z.string().nullable().optional(),
      iconProvider: z.string().nullable().optional(),
    }))
    .mutation(async ({ input }) => {
      const maxOrderResult = await db
        .select({ maxOrder: sql<number>`MAX(${blogCategories.order})` })
        .from(blogCategories);
      
      const maxOrder = maxOrderResult[0]?.maxOrder || 0;
      
      return await db.insert(blogCategories).values({
        id: nanoid(),
        ...input,
        order: maxOrder + 1,
      });
    }),

  updateBlogCategory: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: translationSchema,
      slug: z.string(),
      description: translationSchema.optional(),
      iconName: z.string().nullable().optional(),
      iconProvider: z.string().nullable().optional(),
      order: z.number(),
      isActive: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await db
        .update(blogCategories)
        .set(data)
        .where(eq(blogCategories.id, id));
    }),

  deleteBlogCategory: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      return db.delete(blogCategories)
        .where(eq(blogCategories.id, input));
    }),

  changeBlogCategoryOrder: protectedProcedure
    .input(z.object({
      id: z.string(),
      direction: z.enum(["up", "down"]),
    }))
    .mutation(async ({ input }) => {
      const { id, direction } = input;
      
      const allCategories = await db.select().from(blogCategories).orderBy(blogCategories.order);
      
      const currentIndex = allCategories.findIndex((category) => category.id === id);
      if (currentIndex === -1) {
        throw new Error("Category not found");
      }
      
      if (direction === "up" && currentIndex === 0) {
        throw new Error("Cannot move the first category up");
      }
      if (direction === "down" && currentIndex === allCategories.length - 1) {
        throw new Error("Cannot move the last category down");
      }
      
      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      
      const temp = allCategories[currentIndex];
      allCategories[currentIndex] = allCategories[targetIndex];
      allCategories[targetIndex] = temp;
      
      for (let i = 0; i < allCategories.length; i++) {
        await db.update(blogCategories)
          .set({ order: i + 1 })
          .where(eq(blogCategories.id, allCategories[i].id));
      }
      
      return { success: true };
    }),

  // Blog Posts
  getBlogPosts: publicProcedure
    .input(z.object({
      published: z.boolean().optional(),
      categoryId: z.string().optional(),
      featured: z.boolean().optional(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const { published, categoryId, featured, limit } = input;
      
      const conditions = [];
      
      if (published !== undefined) {
        conditions.push(eq(blogPosts.isPublished, published));
      }
      
      if (categoryId) {
        conditions.push(eq(blogPosts.categoryId, categoryId));
      }
      
      if (featured !== undefined) {
        conditions.push(eq(blogPosts.isFeatured, featured));
      }

      const posts = await db.select().from(blogPosts)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt))
        .limit(limit || 1000);

       const categoryIds = posts.map(p => p.categoryId).filter(Boolean) as string[];
       const categories = categoryIds.length > 0 
         ? await db.select().from(blogCategories).where(inArray(blogCategories.id, categoryIds))
         : [];

             return posts.map(post => {
         const category = categories.find(c => c.id === post.categoryId);
         return {
           ...post,
           title: typeof post.title === 'string' ? JSON.parse(post.title) : post.title,
           content: typeof post.content === 'string' ? JSON.parse(post.content) : post.content,
           excerpt: typeof post.excerpt === 'string' ? JSON.parse(post.excerpt) : post.excerpt,
           metaTitle: typeof post.metaTitle === 'string' ? JSON.parse(post.metaTitle) : post.metaTitle,
           metaDescription: typeof post.metaDescription === 'string' ? JSON.parse(post.metaDescription) : post.metaDescription,
           metaKeywords: typeof post.metaKeywords === 'string' ? JSON.parse(post.metaKeywords) : post.metaKeywords,
           category: category ? {
             ...category,
             name: typeof category.name === 'string' ? JSON.parse(category.name) : category.name,
             description: typeof category.description === 'string' ? JSON.parse(category.description) : category.description,
           } : null,
         };
       });
    }),

  getBlogPostById: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const result = await db.select({
        id: blogPosts.id,
        title: blogPosts.title,
        content: blogPosts.content,
        excerpt: blogPosts.excerpt,
        slug: blogPosts.slug,
        metaTitle: blogPosts.metaTitle,
        metaDescription: blogPosts.metaDescription,
        metaKeywords: blogPosts.metaKeywords,
        ogImage: blogPosts.ogImage,
        isPublished: blogPosts.isPublished,
        publishedAt: blogPosts.publishedAt,
        isFeatured: blogPosts.isFeatured,
        viewCount: blogPosts.viewCount,
        createdAt: blogPosts.createdAt,
        updatedAt: blogPosts.updatedAt,
        categoryId: blogPosts.categoryId,
        category: blogCategories,
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .where(eq(blogPosts.id, input))
      .limit(1);

      if (!result[0]) return null;

      const post = result[0];
      return {
        ...post,
        title: typeof post.title === 'string' ? JSON.parse(post.title) : post.title,
        content: typeof post.content === 'string' ? JSON.parse(post.content) : post.content,
        excerpt: typeof post.excerpt === 'string' ? JSON.parse(post.excerpt) : post.excerpt,
        metaTitle: typeof post.metaTitle === 'string' ? JSON.parse(post.metaTitle) : post.metaTitle,
        metaDescription: typeof post.metaDescription === 'string' ? JSON.parse(post.metaDescription) : post.metaDescription,
        metaKeywords: typeof post.metaKeywords === 'string' ? JSON.parse(post.metaKeywords) : post.metaKeywords,
        category: post.category ? {
          ...post.category,
          name: typeof post.category.name === 'string' ? JSON.parse(post.category.name) : post.category.name,
          description: typeof post.category.description === 'string' ? JSON.parse(post.category.description) : post.category.description,
        } : null,
      };
    }),

  getBlogPostBySlug: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const result = await db.select({
        id: blogPosts.id,
        title: blogPosts.title,
        content: blogPosts.content,
        excerpt: blogPosts.excerpt,
        slug: blogPosts.slug,
        metaTitle: blogPosts.metaTitle,
        metaDescription: blogPosts.metaDescription,
        metaKeywords: blogPosts.metaKeywords,
        ogImage: blogPosts.ogImage,
        isPublished: blogPosts.isPublished,
        publishedAt: blogPosts.publishedAt,
        isFeatured: blogPosts.isFeatured,
        viewCount: blogPosts.viewCount,
        createdAt: blogPosts.createdAt,
        updatedAt: blogPosts.updatedAt,
        categoryId: blogPosts.categoryId,
        category: blogCategories,
      })
      .from(blogPosts)
      .leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id))
      .where(eq(blogPosts.slug, input))
      .limit(1);

      if (!result[0]) return null;

      const post = result[0];
      return {
        ...post,
        title: typeof post.title === 'string' ? JSON.parse(post.title) : post.title,
        content: typeof post.content === 'string' ? JSON.parse(post.content) : post.content,
        excerpt: typeof post.excerpt === 'string' ? JSON.parse(post.excerpt) : post.excerpt,
        metaTitle: typeof post.metaTitle === 'string' ? JSON.parse(post.metaTitle) : post.metaTitle,
        metaDescription: typeof post.metaDescription === 'string' ? JSON.parse(post.metaDescription) : post.metaDescription,
        metaKeywords: typeof post.metaKeywords === 'string' ? JSON.parse(post.metaKeywords) : post.metaKeywords,
        category: post.category ? {
          ...post.category,
          name: typeof post.category.name === 'string' ? JSON.parse(post.category.name) : post.category.name,
          description: typeof post.category.description === 'string' ? JSON.parse(post.category.description) : post.category.description,
        } : null,
      };
    }),

  createBlogPost: protectedProcedure
    .input(z.object({
      categoryId: z.string().nullable().optional(),
      title: translationSchema,
      slug: z.string(),
      content: translationSchema,
      excerpt: translationSchema.optional(),
      metaTitle: translationSchema.optional(),
      metaDescription: translationSchema.optional(),
      metaKeywords: translationSchema.optional(),
      ogImage: z.string().optional(),
      isPublished: z.boolean().optional(),
      publishedAt: z.string().optional(),
      isFeatured: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      return db.insert(blogPosts).values({
        id: nanoid(),
        ...input,
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
        viewCount: 0,
      });
    }),

  updateBlogPost: protectedProcedure
    .input(z.object({
      id: z.string(),
      categoryId: z.string().nullable().optional(),
      title: translationSchema,
      slug: z.string(),
      content: translationSchema,
      excerpt: translationSchema.optional(),
      metaTitle: translationSchema.optional(),
      metaDescription: translationSchema.optional(),
      metaKeywords: translationSchema.optional(),
      ogImage: z.string().optional(),
      isPublished: z.boolean(),
      publishedAt: z.string().optional(),
      isFeatured: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.update(blogPosts)
        .set({
          ...data,
          publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
        })
        .where(eq(blogPosts.id, id));
    }),

  deleteBlogPost: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      return db.delete(blogPosts)
        .where(eq(blogPosts.id, input));
    }),

  incrementViewCount: publicProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      return db.update(blogPosts)
        .set({
          viewCount: sql`${blogPosts.viewCount} + 1`,
        })
        .where(eq(blogPosts.id, input));
    }),
}); 
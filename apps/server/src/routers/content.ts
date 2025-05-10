import { z } from "zod";
import { protectedProcedure, router } from "../lib/trpc";
import { db } from "../db";
import { contact, homepage, navigation, projects, skills, topBar } from "../db/schema/content";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

const translationSchema = z.object({
  pl: z.string(),
  en: z.string(),
});

const linkSchema = z.object({
  url: z.string().optional(),
  external: z.boolean(),
  newTab: z.boolean(),
});

export const contentRouter = router({
  // Navigation
  getNavigation: protectedProcedure.query(async () => {
    return db.select().from(navigation).orderBy(navigation.order);
  }),
  createNavItem: protectedProcedure
    .input(z.object({
      label: translationSchema,
      order: z.number(),
      ...linkSchema.shape,
    }))
    .mutation(async ({ input }) => {
      return db.insert(navigation).values({
        id: nanoid(),
        ...input,
      });
    }),
  updateNavItem: protectedProcedure
    .input(z.object({
      id: z.string(),
      label: translationSchema,
      order: z.number(),
      isActive: z.boolean(),
      ...linkSchema.shape,
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.update(navigation)
        .set(data)
        .where(eq(navigation.id, id));
    }),
  deleteNavItem: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      return db.delete(navigation)
        .where(eq(navigation.id, input));
    }),

  // Top Bar
  getTopBar: protectedProcedure.query(async () => {
    return db.select().from(topBar).orderBy(topBar.order);
  }),
  createTopBarItem: protectedProcedure
    .input(z.object({
      name: translationSchema,
      iconName: z.string(),
      order: z.number(),
      ...linkSchema.shape,
    }))
    .mutation(async ({ input }) => {
      return db.insert(topBar).values({
        id: nanoid(),
        ...input,
      });
    }),
  updateTopBarItem: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: translationSchema,
      iconName: z.string(),
      order: z.number(),
      ...linkSchema.shape,
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.update(topBar)
        .set(data)
        .where(eq(topBar.id, id));
    }),
  deleteTopBarItem: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      return db.delete(topBar)
        .where(eq(topBar.id, input));
    }),

  // Homepage
  getHomepage: protectedProcedure.query(async () => {
    const result = await db.select().from(homepage).limit(1);
    if (!result[0]) return null;
    
    const data = result[0];
    return {
      ...data,
      welcomeText: typeof data.welcomeText === 'string' ? JSON.parse(data.welcomeText) : data.welcomeText,
      specializationText: typeof data.specializationText === 'string' ? JSON.parse(data.specializationText) : data.specializationText,
      aboutMeText: typeof data.aboutMeText === 'string' ? JSON.parse(data.aboutMeText) : data.aboutMeText,
    };
  }),
  updateHomepage: protectedProcedure
    .input(z.object({
      welcomeText: translationSchema,
      specializationText: translationSchema,
      aboutMeText: translationSchema,
    }))
    .mutation(async ({ input }) => {
      const existing = await db.select().from(homepage).limit(1);
      if (existing.length === 0) {
        return db.insert(homepage).values({
          id: nanoid(),
          ...input,
        });
      }
      return db.update(homepage)
        .set(input)
        .where(eq(homepage.id, existing[0].id));
    }),

  // Projects
  getProjects: protectedProcedure.query(async () => {
    return db.select().from(projects).orderBy(projects.order);
  }),
  createProject: protectedProcedure
    .input(z.object({
      title: translationSchema,
      description: translationSchema,
      url: z.string().optional(),
      repoUrl: z.string().optional(),
      imageUrl: z.string().optional(),
      order: z.number(),
    }))
    .mutation(async ({ input }) => {
      return db.insert(projects).values({
        id: nanoid(),
        ...input,
      });
    }),
  updateProject: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: translationSchema,
      description: translationSchema,
      url: z.string().optional(),
      repoUrl: z.string().optional(),
      imageUrl: z.string().optional(),
      order: z.number(),
      isActive: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.update(projects)
        .set(data)
        .where(eq(projects.id, id));
    }),
  deleteProject: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      return db.delete(projects)
        .where(eq(projects.id, input));
    }),

  // Skills
  getSkills: protectedProcedure.query(async () => {
    const results = await db.select().from(skills).orderBy(skills.order);
    return results.map(skill => ({
      ...skill,
      name: typeof skill.name === 'string' ? JSON.parse(skill.name) : skill.name,
      category: typeof skill.category === 'string' ? JSON.parse(skill.category) : skill.category,
    }));
  }),
  createSkill: protectedProcedure
    .input(z.object({
      name: translationSchema,
      category: translationSchema,
      iconName: z.string(),
      order: z.number(),
    }))
    .mutation(async ({ input }) => {
      return db.insert(skills).values({
        id: nanoid(),
        ...input,
      });
    }),
  updateSkill: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: translationSchema,
      category: translationSchema,
      iconName: z.string(),
      order: z.number(),
      isActive: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.update(skills)
        .set(data)
        .where(eq(skills.id, id));
    }),
  deleteSkill: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      return db.delete(skills)
        .where(eq(skills.id, input));
    }),

  // Contact
  getContact: protectedProcedure.query(async () => {
    return db.select().from(contact).orderBy(contact.order);
  }),
  createContact: protectedProcedure
    .input(z.object({
      name: translationSchema,
      order: z.number(),
      ...linkSchema.shape,
    }))
    .mutation(async ({ input }) => {
      return db.insert(contact).values({
        id: nanoid(),
        ...input,
      });
    }),
  updateContact: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: translationSchema,
      order: z.number(),
      ...linkSchema.shape,
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.update(contact)
        .set(data)
        .where(eq(contact.id, id));
    }),
  deleteContact: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      return db.delete(contact)
        .where(eq(contact.id, input));
    }),
});

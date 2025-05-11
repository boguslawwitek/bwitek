import { z } from "zod";
import { protectedProcedure, router } from "../lib/trpc";
import { db } from "../db";
import { contact, homepage, navigation, projects, skills, skillCategories, topBar } from "../db/schema/content";
import { eq, sql } from "drizzle-orm";
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

  // Skills Category
  getSkillCategories: protectedProcedure.query(async () => {
    const results = await db.select().from(skillCategories).orderBy(skillCategories.order);
    return results.map(category => ({
      ...category,
      name: typeof category.name === 'string' ? JSON.parse(category.name) : category.name,
    }));
  }),
  
  createSkillCategory: protectedProcedure
    .input(z.object({
      name: translationSchema,
    }))
    .mutation(async ({ input }) => {
      const maxOrderResult = await db
        .select({ maxOrder: sql<number>`MAX(${skillCategories.order})` })
        .from(skillCategories);
      
      const maxOrder = maxOrderResult[0]?.maxOrder || 0;
      
      return await db.insert(skillCategories).values({
        id: nanoid(),
        name: input.name,
        order: maxOrder + 1,
      });
    }),
    
  updateSkillCategory: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: translationSchema,
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await db
        .update(skillCategories)
        .set(data)
        .where(eq(skillCategories.id, id));
    }),
    
  changeSkillCategoryOrder: protectedProcedure
    .input(z.object({
      id: z.string(),
      direction: z.enum(["up", "down"]),
    }))
    .mutation(async ({ input }) => {
      const { id, direction } = input;
      
      const allCategories = await db.select().from(skillCategories).orderBy(skillCategories.order);
      
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
        await db.update(skillCategories)
          .set({ order: i + 1 })
          .where(eq(skillCategories.id, allCategories[i].id));
      }
      
      return { success: true };
    }),
    
  deleteSkillCategory: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      return db.delete(skillCategories)
        .where(eq(skillCategories.id, input));
    }),
  
  // Skills
  getSkills: protectedProcedure.query(async () => {
    const skillsData = await db.select()
      .from(skills)
      .leftJoin(skillCategories, eq(skills.categoryId, skillCategories.id))
      .orderBy(skills.order);
      
    return skillsData.map(row => ({
      id: row.skills.id,
      name: typeof row.skills.name === 'string' ? JSON.parse(row.skills.name) : row.skills.name,
      categoryId: row.skills.categoryId,
      category: row.skill_categories ? 
        (typeof row.skill_categories.name === 'string' ? 
          JSON.parse(row.skill_categories.name) : 
          row.skill_categories.name) : 
        null,
      iconName: row.skills.iconName,
      iconProvider: row.skills.iconProvider,
      order: row.skills.order,
      isActive: row.skills.isActive,
    }));
  }),
  createSkill: protectedProcedure
    .input(z.object({
      name: translationSchema,
      categoryId: z.string().nullable(),
      iconName: z.string().nullable(),
      iconProvider: z.string().nullable(),
      order: z.number(),
      isActive: z.boolean().optional().default(true),
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
      categoryId: z.string().nullable(),
      iconName: z.string().nullable(),
      iconProvider: z.string().nullable(),
      order: z.number(),
      isActive: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.update(skills)
        .set(data)
        .where(eq(skills.id, id));
    }),

  changeSkillOrder: protectedProcedure
    .input(z.object({
      id: z.string(),
      direction: z.enum(["up", "down"])
    }))
    .mutation(async ({ input }) => {
      const { id, direction } = input;
      
      const allSkills = await db.select().from(skills).orderBy(skills.order);
      
      const currentIndex = allSkills.findIndex((skill) => skill.id === id);
      if (currentIndex === -1) {
        throw new Error("Skill not found");
      }
      
      if (direction === "up" && currentIndex === 0) {
        throw new Error("Cannot move the first skill up");
      }
      if (direction === "down" && currentIndex === allSkills.length - 1) {
        throw new Error("Cannot move the last skill down");
      }
      
      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      
      const temp = allSkills[currentIndex];
      allSkills[currentIndex] = allSkills[targetIndex];
      allSkills[targetIndex] = temp;
      
      for (let i = 0; i < allSkills.length; i++) {
        await db.update(skills)
          .set({ order: i + 1 })
          .where(eq(skills.id, allSkills[i].id));
      }
      
      return { success: true };
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

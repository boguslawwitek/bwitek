import { db } from "./index";
import { homepage } from "./schema/content";
import { v4 as uuid } from "uuid";

async function seed() {
  // Seed homepage content
  const existingHomepage = await db.select().from(homepage).limit(1);
  if (existingHomepage.length === 0) {
    await db.insert(homepage).values({
      id: uuid(),
      welcomeText: {
        pl: "Witaj na mojej stronie!",
        en: "Welcome to my website!",
      },
      specializationText: {
        pl: "Jestem full-stack developerem specjalizującym się w technologiach webowych.",
        en: "I'm a full-stack developer specializing in web technologies.",
      },
      aboutMeText: {
        pl: "Pasjonuję się tworzeniem nowoczesnych aplikacji internetowych.",
        en: "I'm passionate about creating modern web applications.",
      },
    });
    console.log("✅ Homepage content seeded");
  } else {
    console.log("ℹ️ Homepage content already exists");
  }
}

seed()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });

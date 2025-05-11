import { homepage } from "../schema/content";
import { v4 as uuid } from "uuid";
import { db } from "../index";

export async function seedHomepage() {
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
    console.log("✓ Homepage content seeded successfully");
  } else {
    console.log("✓ Homepage content already exists, skipping seed");
  }
}

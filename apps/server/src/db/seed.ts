import { seedHomepage } from "./seeds/homepage";

async function seed() {
  console.log("🌱 Starting database seeding...");
  
  // Add all seeds here
  await seedHomepage();
  
  console.log("✨ Database seeding completed");
}

seed().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});

import { createClient, users } from "./index";

const seed = async () => {
  const url = process.env.DATABASE_URL;
  const syncUrl = process.env.DATABASE_SYNC_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  console.log("🌱 Seeding database...");

  const db = createClient({
    url,
    syncUrl,
    authToken,
  });

  // Example: Create a test user
  await db.insert(users).values({
    name: "Test User",
    email: "test@example.com",
  });

  console.log("✅ Database seeded successfully");
};

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });


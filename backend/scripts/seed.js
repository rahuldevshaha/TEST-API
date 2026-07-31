/**
 * One-time convenience script: pushes sample products into your MockAPI.io
 * resource so the app has data to show right after setup. MockAPI starts
 * empty by default (unless you generated mock data in its dashboard).
 *
 * Usage:
 *   cd backend
 *   npm run seed
 */
require("dotenv").config();
const mockApiService = require("../services/mockApiService");
const sampleProducts = require("./sampleProducts.json");

const run = async () => {
  if (!process.env.MOCKAPI_BASE_URL) {
    console.error("MOCKAPI_BASE_URL is not set in .env - aborting.");
    process.exit(1);
  }

  console.log(`Seeding ${sampleProducts.length} products into MockAPI...`);

  let created = 0;
  for (const product of sampleProducts) {
    try {
      await mockApiService.create({ ...product, createdAt: new Date().toISOString() });
      created += 1;
      process.stdout.write(".");
    } catch (err) {
      console.error(`\nFailed to create "${product.title}": ${err.message}`);
    }
  }

  console.log(`\nDone. ${created}/${sampleProducts.length} products created.`);
  process.exit(0);
};

run();

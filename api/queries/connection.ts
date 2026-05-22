import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function getDb() {
  if (!instance) {
    const connectionString = process.env.DATABASE_URL || "";
    const pool = new Pool({ connectionString });
    instance = drizzle(pool, { schema: fullSchema });
  }
  return instance;
}

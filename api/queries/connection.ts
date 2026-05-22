import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

export function getDb() {
  if (!instance) {
    const connectionString = process.env.DATABASE_URL || "";
    const client = postgres(connectionString, { max: 1 });
    instance = drizzle(client, { schema: fullSchema });
  }
  return instance;
}

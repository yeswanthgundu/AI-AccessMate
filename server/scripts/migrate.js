import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const migrationPath = path.resolve(__dirname, "../../supabase/migrations/001_initial_schema.sql");

async function runMigration() {
  console.log("=================================================");
  console.log("AI AccessMate — Supabase Schema Migration Runner");
  console.log("=================================================");

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env");
    process.exit(1);
  }

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found at: ${migrationPath}`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(migrationPath, "utf-8");
  console.log(`📄 Loaded migration script: ${migrationPath}`);
  console.log(`🔗 Target Supabase Project: ${supabaseUrl}`);

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  console.log("\n🔍 Checking Supabase table availability...");
  const { data: users, error: userErr } = await supabase.from("users").select("id").limit(1);

  if (!userErr) {
    console.log("✅ Tables already exist and are active on Supabase Cloud PostgreSQL!");
    console.log("Migration check completed successfully.");
    return;
  }

  console.log(`ℹ️ Supabase status: ${userErr.message}`);
  console.log("\nAttempting to run migration via RPC or PG connection...");

  // Check if an RPC function exists to run SQL
  const { error: rpcErr } = await supabase.rpc("exec_sql", { query: sqlContent });
  if (!rpcErr) {
    console.log("✅ Migration applied successfully via exec_sql RPC!");
    return;
  }

  // If REST DDL is restricted (standard security model for Supabase client),
  // provide clear guidance and connection details:
  console.log("\n-------------------------------------------------");
  console.log("📋 Notice: Supabase Cloud restricts DDL (CREATE TABLE) via client REST API.");
  console.log("To ensure all 3 tables are created in your Supabase project:");
  console.log("1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/pkxwejdjfujrnmimroua");
  console.log("2. Navigate to 'SQL Editor' -> 'New query'");
  console.log("3. Copy and run the script from /supabase/migrations/001_initial_schema.sql");
  console.log("4. AI AccessMate will automatically use Supabase Cloud PostgreSQL once tables are created.");
  console.log("-------------------------------------------------\n");
}

runMigration().catch((err) => {
  console.error("Migration runner error:", err);
});

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Testing Supabase Cloud PostgreSQL connection...");
console.log("Supabase URL:", SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testConnection() {
  try {
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("*")
      .limit(1);

    if (usersError) {
      console.log("Table 'users' status:", usersError.message, usersError.code);
    } else {
      console.log("Table 'users' exists! Row count sample:", usersData.length);
    }

    const { data: prefData, error: prefError } = await supabase
      .from("preferences")
      .select("*")
      .limit(1);
    
    if (prefError) {
      console.log("Table 'preferences' status:", prefError.message);
    } else {
      console.log("Table 'preferences' exists! Row count sample:", prefData.length);
    }

    const { data: histData, error: histError } = await supabase
      .from("history")
      .select("*")
      .limit(1);

    if (histError) {
      console.log("Table 'history' status:", histError.message);
    } else {
      console.log("Table 'history' exists! Row count sample:", histData.length);
    }
  } catch (err) {
    console.error("Test error:", err);
  }
}

testConnection();

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const supabaseUrl = process.env.SUPABASE_URL || "https://pkxwejdjfujrnmimroua.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })
  : null;

// Local fallback store path
const LOCAL_DB_PATH = path.resolve(__dirname, "local_store.json");

function readLocalDb() {
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    const initialData = {
      users: [
        {
          id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
          name: "Aarav Sharma",
          email: "demo@accessmate.ai",
          // password is 'Demo1234!'
          password_hash: "$2b$10$1WL.C9pnW.d7EoyhvDqj5.0WQaQkWSDo.i0MGjEM3RY4FM0jq7Qwu",
          ability_profile: "dyslexia",
          preferred_language: "Telugu",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      preferences: [
        {
          user_id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
          font_size: "large",
          high_contrast: true,
          speech_speed: 0.9,
          language: "Telugu",
          ability_profile: "dyslexia",
          updated_at: new Date().toISOString(),
        },
      ],
      history: [
        {
          id: "h1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6e",
          user_id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
          feature: "simplifier",
          input_payload:
            "The beneficiary must furnish an affidavit attesting to indigent status prior to disbursement of subsidies.",
          output_payload: {
            originalText:
              "The beneficiary must furnish an affidavit attesting to indigent status prior to disbursement of subsidies.",
            simplifiedText:
              "You need to submit a signed paper proving you need financial help before you get the money.",
            readingLevel: "Grade 3",
            readabilityScoreBefore: 28.5,
            readabilityScoreAfter: 86.4,
          },
          created_at: new Date().toISOString(),
        },
      ],
    };
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  try {
    return JSON.parse(fs.readFileSync(LOCAL_DB_PATH, "utf-8"));
  } catch (e) {
    return { users: [], preferences: [], history: [] };
  }
}

function writeLocalDb(data) {
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
}

let isSupabaseAvailable = false;

// Check once at startup if Supabase tables are ready
async function checkSupabaseReady() {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("users").select("id").limit(1);
    if (!error) {
      isSupabaseAvailable = true;
      console.log("⚡ Supabase Cloud PostgreSQL is active and connected.");
      return true;
    }
  } catch (e) {
    // fallback
  }
  isSupabaseAvailable = false;
  return false;
}

checkSupabaseReady();

export const db = {
  async isSupabaseConnected() {
    return await checkSupabaseReady();
  },

  async getUserByEmail(email) {
    const isReady = await checkSupabaseReady();
    if (isReady) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email.toLowerCase())
        .maybeSingle();
      if (!error && data) return data;
    }
    const local = readLocalDb();
    return local.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async getUserById(id) {
    const isReady = await checkSupabaseReady();
    if (isReady) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!error && data) return data;
    }
    const local = readLocalDb();
    return local.users.find((u) => u.id === id) || null;
  },

  async createUser({ name, email, password_hash, ability_profile = "default", preferred_language = "English" }) {
    const id = crypto.randomUUID();
    const newUser = {
      id,
      name,
      email: email.toLowerCase(),
      password_hash,
      ability_profile,
      preferred_language,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const isReady = await checkSupabaseReady();
    if (isReady) {
      const { data, error } = await supabase.from("users").insert(newUser).select().single();
      if (!error && data) {
        // Create default preferences
        await supabase.from("preferences").insert({
          user_id: id,
          font_size: "medium",
          high_contrast: ability_profile === "low-vision",
          speech_speed: ability_profile === "elderly" ? 0.85 : 1.0,
          language: preferred_language,
          ability_profile,
          updated_at: new Date().toISOString(),
        });
        return data;
      }
    }

    // Local fallback
    const local = readLocalDb();
    local.users.push(newUser);
    local.preferences.push({
      user_id: id,
      font_size: "medium",
      high_contrast: ability_profile === "low-vision",
      speech_speed: ability_profile === "elderly" ? 0.85 : 1.0,
      language: preferred_language,
      ability_profile,
      updated_at: new Date().toISOString(),
    });
    writeLocalDb(local);
    return newUser;
  },

  async getPreferencesByUserId(userId) {
    const isReady = await checkSupabaseReady();
    if (isReady) {
      const { data, error } = await supabase
        .from("preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (!error && data) return data;
    }
    const local = readLocalDb();
    return local.preferences.find((p) => p.user_id === userId) || {
      user_id: userId,
      font_size: "medium",
      high_contrast: false,
      speech_speed: 1.0,
      language: "English",
      ability_profile: "default",
    };
  },

  async updatePreferences(userId, updateData) {
    const isReady = await checkSupabaseReady();
    if (isReady) {
      const { data, error } = await supabase
        .from("preferences")
        .upsert({
          user_id: userId,
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (!error && data) return data;
    }

    const local = readLocalDb();
    let pref = local.preferences.find((p) => p.user_id === userId);
    if (!pref) {
      pref = {
        user_id: userId,
        font_size: "medium",
        high_contrast: false,
        speech_speed: 1.0,
        language: "English",
        ability_profile: "default",
        ...updateData,
        updated_at: new Date().toISOString(),
      };
      local.preferences.push(pref);
    } else {
      Object.assign(pref, updateData, { updated_at: new Date().toISOString() });
    }
    writeLocalDb(local);
    return pref;
  },

  async addHistory({ userId, feature, input_payload, output_payload }) {
    const newHistory = {
      id: crypto.randomUUID(),
      user_id: userId,
      feature,
      input_payload: typeof input_payload === "string" ? input_payload : JSON.stringify(input_payload),
      output_payload,
      created_at: new Date().toISOString(),
    };

    const isReady = await checkSupabaseReady();
    if (isReady) {
      const { data, error } = await supabase.from("history").insert(newHistory).select().single();
      if (!error && data) return data;
    }

    const local = readLocalDb();
    local.history.unshift(newHistory);
    writeLocalDb(local);
    return newHistory;
  },

  async getHistoryByUserId(userId, limit = 50) {
    const isReady = await checkSupabaseReady();
    if (isReady) {
      const { data, error } = await supabase
        .from("history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (!error && data) return data;
    }

    const local = readLocalDb();
    return local.history
      .filter((h) => h.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  },

  async deleteHistoryItem(id, userId) {
    const isReady = await checkSupabaseReady();
    if (isReady) {
      const { error } = await supabase
        .from("history")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      if (!error) return true;
    }

    const local = readLocalDb();
    const beforeCount = local.history.length;
    local.history = local.history.filter((h) => !(h.id === id && h.user_id === userId));
    writeLocalDb(local);
    return local.history.length < beforeCount;
  },
};

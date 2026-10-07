import { z } from "zod";
import { db } from "../database/db.js";

const preferencesSchema = z.object({
  font_size: z.enum(["small", "medium", "large", "x-large"]).optional(),
  high_contrast: z.boolean().optional(),
  speech_speed: z.number().min(0.5).max(2.0).optional(),
  language: z.string().optional(),
  ability_profile: z.string().optional(),
});

export async function getProfile(req, res) {
  try {
    const userId = req.user.id;
    const user = await db.getUserById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    const preferences = await db.getPreferencesByUserId(userId);

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        ability_profile: user.ability_profile,
        preferred_language: user.preferred_language,
      },
      preferences,
    });
  } catch (err) {
    console.error("Get Profile Error:", err);
    return res.status(500).json({ success: false, error: "Failed to load user profile." });
  }
}

export async function updatePreferences(req, res) {
  try {
    const userId = req.user.id;
    const validated = preferencesSchema.parse(req.body);

    const updated = await db.updatePreferences(userId, validated);

    return res.json({
      success: true,
      preferences: updated,
      message: "Accessibility preferences updated successfully.",
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: err.errors.map((e) => e.message).join(", "),
      });
    }
    console.error("Update Preferences Error:", err);
    return res.status(500).json({ success: false, error: "Failed to update preferences." });
  }
}

export async function getHistory(req, res) {
  try {
    const userId = req.user.id;
    const history = await db.getHistoryByUserId(userId, 100);

    return res.json({
      success: true,
      history,
    });
  } catch (err) {
    console.error("Get History Error:", err);
    return res.status(500).json({ success: false, error: "Failed to retrieve interaction history." });
  }
}

export async function deleteHistory(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const removed = await db.deleteHistoryItem(id, userId);

    return res.json({
      success: true,
      removed,
      message: removed ? "Record deleted." : "Record not found.",
    });
  } catch (err) {
    console.error("Delete History Error:", err);
    return res.status(500).json({ success: false, error: "Failed to delete record." });
  }
}

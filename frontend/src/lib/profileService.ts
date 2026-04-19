import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;

export async function ensureProfile(user: User): Promise<Profile> {
  const fullName = user.user_metadata?.full_name ||
    [user.user_metadata?.first_name, user.user_metadata?.last_name]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    null;

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        avatar_url: user.user_metadata?.avatar_url ?? null,
        email: user.email ?? null,
        full_name: fullName,
        id: user.id,
      },
      { onConflict: "id" },
    )
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

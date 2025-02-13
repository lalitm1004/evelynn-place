import type { SupabaseClient, User } from "@supabase/supabase-js";
import { writable } from "svelte/store";

export const SupaStore = writable<SupabaseClient>();

// exclusively for components
export const UserStore = writable<User | null>(null);
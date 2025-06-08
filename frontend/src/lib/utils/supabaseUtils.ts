import type { User } from "@supabase/supabase-js";

export const USER_TYPE = {
    ADMIN: "ADMIN",
    HELPER: "HELPER",
    BASE: "BASE",
} as const;
export type UserType = typeof USER_TYPE[keyof typeof USER_TYPE]

export type CustomClaims = {
    type: UserType;
    is_whitelisted: boolean;
}

export const getCustomClaims = (user: User | null): CustomClaims | null => {
    if (!user) return null;
    return user.app_metadata.custom_claims
}
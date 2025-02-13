import type { IUserCustomClaims } from "$lib/types/userCustomClaims.type";
import { UserRole, UserType } from "@prisma/client";
import type { User } from "@supabase/supabase-js";

export const getCustomClaims = (user: User | null): IUserCustomClaims => {
    return (user && user.app_metadata.custom_claims) || {
        is_whitelisted: false,
        role: UserRole.BASE,
        type: UserType.STUDENT,
    }
}
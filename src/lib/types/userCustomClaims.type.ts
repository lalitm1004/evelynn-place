import type { UserRole, UserType } from "@prisma/client";

export interface IUserCustomClaims {
    is_whitelisted: boolean;
    role: UserRole;
    type: UserType
}
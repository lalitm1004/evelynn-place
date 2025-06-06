import type { User } from "@supabase/supabase-js";

export enum UserType {
    ADMIN = 'ADMIN',
    HELPER = 'HELPER',
    PLAYER = 'PLAYER',
};

export interface ICustomClaims {
    type: UserType,
}

export const getCustomClaims = (user: User | null): ICustomClaims => {
    return (user && user.app_metadata.custom_claims) || {
        type: UserType.PLAYER,
    };
}
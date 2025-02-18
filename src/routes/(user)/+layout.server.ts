import { getUserProfile } from "$lib/server/database/user.db";
import type { LayoutServerLoad } from "./$types";

// @ts-ignore typescript can only do so much to "fix" webdev
export const load: LayoutServerLoad = async ({ locals }) => {
    const userId = locals.user?.id!;
    const profile = await getUserProfile(userId);
    return {
        profile
    };
}
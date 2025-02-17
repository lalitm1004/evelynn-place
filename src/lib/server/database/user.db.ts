import { db } from '$lib/server/database/prisma';

export const getUserProfile = async (id: string) => {
    return await db.userProfile.findUnique({
        where: { id }
    });
}
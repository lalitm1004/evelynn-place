import { db } from '$lib/server/database/prisma';

export const getUserProfile = async (id: string) => {
    return await db.userProfile.findUnique({
        where: { id }
    });
}

export const requestWhitelisting = async (id: string) => {
    return await db.whitelistApplication.create({
        data: {
            userId: id
        }
    });
}
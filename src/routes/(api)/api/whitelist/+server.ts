import { requestWhitelisting } from "$lib/server/database/user.db";
import { RedirectError } from "$lib/types/redirectError.type";
import { Prisma } from "@prisma/client";
import { json, redirect, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ locals: { user } }) => {
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const application = await requestWhitelisting(user.id);

        return json({
            success: true,
            message: 'Whitelist application submitted successfully',
            application
        }, { status: 201 });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return json({
                success: false,
                message: 'P2002'
            }, { status: 409 });
        }

        console.error(`/whitelist POST error: ${error}`);
        const params = new URLSearchParams({
            type: RedirectError.SERVER_ERROR,
            message: `An unexpected error occured while processing your request\n\n\n${error}`
        });
        redirect(303, `/error?${params.toString()}`);
    }
}
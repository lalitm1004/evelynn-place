import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '$env/static/private';

export const POST: RequestHandler = async ({ fetch, request, locals: { user } }) => {
    if (!user) return json({ error: 'Unauthorized' }, { status: 401 });

    const { refreshToken } = await request.json();
    if (!refreshToken) return json({ error: 'Missing refresh_token' }, { status: 400 });

    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        })
    })

    if (!response.ok) return json({ error: 'Failed to refresh token' }, { status: 400 })

    const data = await response.json();
    return json({
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken,
        expiresIn: data.expires_in
    }, { status: 200 });
}
import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

import createSupabase from "$lib/server/middleware/createSupabase";
import authGuard from "$lib/server/middleware/authGuard";
import handleVisuals from "$lib/server/middleware/handleVisuals";

export const handle: Handle = sequence(createSupabase, authGuard, handleVisuals);
<script lang="ts">
    import { getCustomClaims } from '$lib/utils/supabaseUtils.js';

    let { data } = $props();
    let { supabase, user } = $derived(data);

    const handleSignIn = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/api/auth/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });
    }

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    }
</script>

<main class={`h-screen w-screen grid place-items-center`}>
    {#if user}
        <div>
            <div>
                {user.email}
                {getCustomClaims(user).type}
            </div>

            <button onclick={() => handleSignOut()} class={`rounded-md border-2 px-4 py-2`}>
                Sign Out
            </button>
        </div>

    {:else}
        <button onclick={() => handleSignIn()} class={`rounded-md border-2 px-4 py-2`}>
            Sign In
        </button>
    {/if}
</main>

<svelte:head>
    <title>Labyrinth</title>
</svelte:head>
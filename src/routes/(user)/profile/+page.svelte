<script lang="ts">
    import { addToast } from '$lib/stores/ToastStore.js';

    let { data } = $props();
    let { profile, user, supabase } = $derived(data);

    const handleSignout = () => {
        return;
        supabase.auth.signOut();
    }

    const handleWhitelistRequest = async () => {
        const response = await fetch('/api/whitelist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });
        const data  = await response.json()

        if (data.success) {
            addToast({
                message: 'Whitelist applicaiton submitted successfully!',
                type: 'success',
            });
            return;
        }

        if (data.message === 'P2002') {
            addToast({
                message: 'You have already submitted a whitelist request.',
                type: 'warning'
            })
            return;
        }

        addToast({
            message: 'An unexpected error has occured, please try again later.',
            type: 'danger'
        })
        return;
    }
</script>

<main class={`min-h-dvh w-dvw flex justify-center items-center`}>
    <div class={`md:w-[20%] w-[95%] min-w-fit flex flex-col gap-4`}>
        <!-- profile card -->
        <div class={`apply-card w-full flex flex-col px-4 py-4 gap-2 rounded-lg`}>
            <div class={`flex justify-center items-center gap-4`}>
                <img class={`h-[35px] aspect-square rounded-full`} src={user?.user_metadata.picture} alt={`user pfp`}/>
                <p class={`text-3xl`}>{profile?.name}</p>
            </div>

            <hr class={`w-full border-neutral-400/40`}/>

            <div class={`grid grid-cols-2 gap-4`}>
                <div class={`flex gap-2`}>
                    {@render emailSvg()}
                    <p class={`text-left`}>Email</p>
                </div>
                <p class={`text-right`}>{user?.email}</p>

                <div class={`flex gap-2`}>
                    {@render unlockedSvg()}
                    <p class={`text-left`}>Whitelisted</p>
                </div>
                <p class={`text-right`}>{String(profile?.isWhitelisted)[0].toUpperCase() + String(profile?.isWhitelisted).slice(1)}</p>

                <div class={`flex gap-2`}>
                    {@render checkmarkSvg()}
                    <p class={`text-left`}>Type</p>
                </div>
                <p class={`text-right`}>{profile?.type[0]! + profile?.type.toLowerCase().slice(1)}</p>

                <div class={`flex gap-2`}>
                    {@render shieldSvg()}
                    <p class={`text-left`}>Role</p>
                </div>
                <p class={`text-right`}>{profile?.role[0]! + profile?.role.toLowerCase().slice(1)}</p>

                <div class={`flex gap-2`}>
                    {@render calendarSvg()}
                    <p class={`text-left`}>Created On</p>
                </div>
                <p class={`text-right`}>
                    {profile?.createdAt.toLocaleString('en-GB', {
                        timeZone: "Asia/Kolkata",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                    })}
                </p>
            </div>
        </div>

        <div class={`apply-card w-full flex flex-wrap px-2 py-2 rounded-lg ${!profile?.isWhitelisted ? 'justify-between' : 'justify-center'}`}>
            <button class={`apply-card bg-red-600 hover:opacity-70 active:opacity-50 text-neutral-200 px-4 py-2 rounded-lg`} onclick={handleSignout}>
                Sign Out
            </button>

            {#if !profile?.isWhitelisted}
                <button onclick={handleWhitelistRequest} class={`apply-card bg-green-600 hover:opacity-70 active:opacity-50 text-neutral-200 px-4 py-2 rounded-lg`}>
                    Request Whitelisting
                </button>
            {/if}
        </div>
    </div>
</main>

{#snippet emailSvg()}
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail">
        <rect width="20" height="16" x="2" y="4" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
{/snippet}

{#snippet unlockedSvg()}
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock-open">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
    </svg>
{/snippet}

{#snippet checkmarkSvg()}
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-badge-check">
        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>
        <path d="m9 12 2 2 4-4"/>
    </svg>
{/snippet}

{#snippet shieldSvg()}
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield">
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
    </svg>
{/snippet}

{#snippet clockSvg()}
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock-8">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 8 14"/>
    </svg>
{/snippet}

{#snippet calendarSvg()}
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar">
        <path d="M8 2v4"/>
        <path d="M16 2v4"/>
        <rect width="18" height="18" x="3" y="4" rx="2"/>
        <path d="M3 10h18"/>
    </svg>
{/snippet}

<svelte:head>
    <title>Profile</title>
    <meta name="description" content="Profile">
</svelte:head>
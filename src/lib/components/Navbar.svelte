<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import ToggleTheme from "$lib/components/ToggleTheme.svelte";
    import Login from "$lib/components/Login.svelte";
    import { fly, slide } from "svelte/transition";

    const internalAnchors = [
        { id: 0, href: '/dashboard', display: 'Dashboard' },
        { id: 1, href: '/unisync', display: 'UniSync' },
        { id: 2, href: '/profile', display: 'Profile' },
        { id: 3, href: '/controlpanel', display: 'Control Panel' },
    ]

    let mounted: boolean = $state(false);
    onMount(() => {
        mounted = true;
    })
</script>

{#if mounted}
<nav transition:fly={{ y: '-100%' }} class={`mobile:hidden fixed top-4 left-0 h-[40px] w-dvw flex justify-between items-center px-4`}>
    <div>
        <!-- Breadcrumbs -->
    </div>

    <div class={`h-full flex gap-2`}>
        <!-- home anchor -->
        {#if page.url.pathname !== '/'}
            <a
                transition:slide={{ duration: 1000, axis: 'x' }}
                class={`h-full font-kola text-xl grid place-items-center`}
                href={`/`}
            >
                evelynn.place
            </a>
        {/if}

        <!-- internal achors -->
        <div class={`apply-card h-full rounded-full flex items-center px-5 gap-4`}>
            {#each internalAnchors as item (item.id)}
                <a
                    data-currentpage={page.url.pathname === item.href}
                    class={`data-[currentpage="true"]:scale-[1.1] hover:scale-[1.0] scale-[0.9] data-[currentpage="true"]:font-bold data-[currentpage="true"]:cursor-default dark:data-[currentpage="true"]:text-amber-50 dark:hover:text-amber-50 dark:text-neutral-400 transition-all duration-200`}
                    aria-label={`${item.display.toLowerCase()} href`}
                    href={item.href}
                >{item.display}</a>
            {/each}
        </div>

        <Login />

        <!-- theme toggle -->
        <div class={`group apply-card rounded-full`}>
            <ToggleTheme />
        </div>
    </div>
</nav>
{/if}
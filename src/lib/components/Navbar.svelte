<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import ToggleTheme from "$lib/components/ToggleTheme.svelte";
    import Login from "$lib/components/Login.svelte";
    import { fade, fly, slide } from "svelte/transition";
    import { device } from "$lib/stores/VisualStore";
    import { onNavigate } from "$app/navigation";

    const internalAnchors = [
        { id: 0, href: '/dashboard', display: 'Dashboard' },
        { id: 1, href: '/unisync', display: 'UniSync' },
        { id: 2, href: '/profile', display: 'Profile' },
        { id: 3, href: '/controlpanel', display: 'Control Panel' },
    ]

    let isMenuOpen: boolean = $state(false);
    const toggleMenu = () => {
        document.body.style.overflow = isMenuOpen ? 'auto': 'hidden';
        isMenuOpen = !isMenuOpen;
    }

    onNavigate(() => {
        setTimeout(() => {
            document.body.style.overflow = 'auto';
            isMenuOpen = false;
        }, 100)
    })

    let mounted: boolean = $state(false);
    onMount(() => {
        mounted = true;
    })
</script>

{#if $device === 'desktop' }
    {#if mounted}
        <!-- desktop navbar -->
        <nav transition:fly={{ y: '-100%' }} class={`fixed top-4 left-0 z-30 h-[40px] w-dvw flex justify-between items-center px-4`}>
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
{:else}
    {#if mounted}
        <!-- mobile navbar -->
        <nav transition:fade>
            {#if isMenuOpen}
                <!-- blurring screen -->
                <button
                    onclick={toggleMenu}
                    transition:fade={{ duration: 100 }}
                    aria-label={`exit menu`}
                    class={`absolute top-0 left-0 z-20 h-dvh w-dvw bg-black/70 backdrop-blur-sm`}
                ></button>

                <div transition:slide class={`apply-card absolute top-16 right-4 z-30 w-[60%] flex flex-col items-center gap-3 py-4 px-2 rounded-lg backdrop-blur-0`}>
                    {#each internalAnchors as item (item.id)}
                        <a
                            data-currentpage={page.url.pathname === item.href}
                            class={`w-full text-right text-xl data-[currentpage="true"]:scale-[1.1] data-[currentpage="true"]:-translate-x-2 hover:scale-[1.0] scale-[0.9] data-[currentpage="true"]:font-bold data-[currentpage="true"]:cursor-default dark:data-[currentpage="true"]:text-amber-100 dark:hover:text-amber-100 dark:text-amber-50 transition-all duration-200`}
                            aria-label={`${item.display.toLowerCase()}-href`}
                            href={item.href}
                        >{item.display}</a>
                    {/each}

                    <hr class={`w-[90%] my-1 dark:border-neutral-400/40 border-neutral-800`}/>

                    <div class={`w-full flex justify-between items-center px-2`}>
                        <a class={`font-kola text-lg`} href={`/`}>evelynn.place</a>
                        <div class={`group`}>
                            <ToggleTheme />
                        </div>
                    </div>
                </div>
            {/if}

            <button
                onclick={toggleMenu}
                class={`apply-card fixed top-4 right-4 z-30 rounded-lg grid place-items-center px-4 py-2`}
            >
                Menu
            </button>
        </nav>
    {/if}
{/if}
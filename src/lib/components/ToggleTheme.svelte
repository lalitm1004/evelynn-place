<script lang="ts">
    import { setTheme, theme } from '$lib/stores/VisualStore';

    let toggleThemeButton: HTMLButtonElement;

    const handleClick = () => {
        if (
            !toggleThemeButton ||
            !document.startViewTransition ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
            setTheme($theme === 'dark' ? 'light' : 'dark');
            return;
        }

        document.startViewTransition(async () => setTheme($theme === 'dark' ? 'light' : 'dark'));
    }
</script>

<button class={`h-full aspect-square grid place-items-center`} onclick={handleClick} bind:this={toggleThemeButton} aria-label={`toggle theme`}>
    {#if $theme === 'light'}
        {@render moon()}
    {:else}
        {@render sun()}
    {/if}
</button>

{#snippet sun()}
    <svg xmlns="http://www.w3.org/2000/svg" class={`h-[24px] aspect-square group-hover:stroke-amber-50 stroke-neutral-400 group-hover:stroke-[2.5] stroke-2 transition-all duration-400 lucide lucide-sun`} viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2"/>
        <path d="M12 20v2"/>
        <path d="m4.93 4.93 1.41 1.41"/>
        <path d="m17.66 17.66 1.41 1.41"/>
        <path d="M2 12h2"/>
        <path d="M20 12h2"/>
        <path d="m6.34 17.66-1.41 1.41"/>
        <path d="m19.07 4.93-1.41 1.41"/>
    </svg>
{/snippet}

{#snippet moon()}
    <svg xmlns="http://www.w3.org/2000/svg" class={`h-[24px] aspect-square stroke-neutral-800 group-hover:stroke-[2.8] stroke-2 transition-all duration-300 lucide lucide-moon`} viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>
{/snippet}
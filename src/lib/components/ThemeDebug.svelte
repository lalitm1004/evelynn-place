<script lang="ts">
    import { setTheme, theme } from "$lib/stores/VisualStore";
</script>

<button class={`absolute bottom-2 left-2 bg-red-100/10 rounded-md`} onclick={() => setTheme($theme === 'dark' ? 'light' : 'dark')}>
    Switch Theme
</button>
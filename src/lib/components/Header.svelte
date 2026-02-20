<script module lang="ts">
    export type TabType = "timezones" | "stopwatch" | "timer";
</script>

<script lang="ts">
    import { cn } from "$lib/utils";
    import { Clock, Hourglass, Timer, Watch } from "@lucide/svelte";
    import type { Icon } from "@lucide/svelte";

    let {
        activeTab,
        onTabChange,
        use24h,
        onToggleFormat,
    }: {
        activeTab: TabType;
        onTabChange: (tab: TabType) => void;
        use24h: boolean;
        onToggleFormat: () => void;
    } = $props();

    const tabs: { id: TabType; label: string; icon: typeof Icon }[] = [
        { id: "timezones", label: "Timezones", icon: Clock },
        { id: "stopwatch", label: "Stopwatch", icon: Timer },
        { id: "timer", label: "Timer", icon: Hourglass },
    ];
</script>

<header
    class="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl"
>
    <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div class="flex items-center gap-1.5">
            <Watch size={32} class="text-primary" />
            <span class="text-lg font-semibold text-foreground">Zegarek</span>
        </div>

        <nav class="flex items-center gap-1 rounded-lg bg-secondary/50 p-1">
            {#each tabs as tab (tab.id)}
                <button
                    onclick={() => onTabChange(tab.id)}
                    class={cn(
                        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                        activeTab === tab.id
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                    )}
                >
                    <tab.icon />
                    <span class="hidden sm:inline">{tab.label}</span>
                </button>
            {/each}
        </nav>

        <button
            onclick={onToggleFormat}
            class="rounded-md border border-border bg-card px-3 py-1.5 font-mono text-xs font-medium text-foreground transition-colors hover:bg-secondary"
        >
            {use24h ? "24H" : "12H"}
        </button>
    </div>
</header>

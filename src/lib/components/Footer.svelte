<script lang="ts">
    import { untrack } from "svelte";
    import { cn } from "$lib/utils";
    import { Monitor, Moon, Sun } from "@lucide/svelte";
    import type { Icon } from "@lucide/svelte";

    type ThemeMode = "light" | "dark" | "system";

    let theme = $state<ThemeMode>("system");

    const year = new Date().getFullYear();

    const modes: { id: ThemeMode; icon: typeof Icon; label: string }[] = [
        { id: "light", icon: Sun, label: "Light" },
        { id: "system", icon: Monitor, label: "System" },
        { id: "dark", icon: Moon, label: "Dark" },
    ];

    function applyTheme(mode: ThemeMode) {
        const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)",
        ).matches;
        const useDark = mode === "dark" || (mode === "system" && prefersDark);
        document.documentElement.classList.toggle("dark", useDark);
    }

    $effect(() => {
        // One-time init: read saved preference without tracking `theme`,
        // so this effect never re-runs when the user changes the theme.
        untrack(() => {
            const saved = localStorage.getItem("zegarek-theme") as ThemeMode | null;
            if (saved && (["light", "dark", "system"] as string[]).includes(saved)) {
                theme = saved as ThemeMode;
            }
            applyTheme(theme);
        });

        // Keep system mode in sync with OS preference changes.
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const listener = () => {
            if (untrack(() => theme) === "system") applyTheme("system");
        };
        mq.addEventListener("change", listener);
        return () => mq.removeEventListener("change", listener);
        // No reactive reads at the top level → runs once on mount only.
    });


</script>

<footer
    class="border-t border-border bg-background/80 backdrop-blur-xl"
>
    <div
        class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3"
    >
        <p class="text-xs text-muted-foreground">
            &copy; {year} <span class="font-medium">Kamil Marut</span>
            &mdash;
            <a
                href="https://github.com/exler/zegarek"
                target="_blank"
                rel="noopener noreferrer"
                class="transition-colors text-foreground hover:text-primary"
            >
                GitHub
            </a>
        </p>

        <div class="flex items-center gap-0.5 rounded-lg bg-secondary/50 p-1">
            {#each modes as mode (mode.id)}
                <button
                    onclick={() => {
                        theme = mode.id;
                        localStorage.setItem("zegarek-theme", mode.id);
                        applyTheme(mode.id);
                    }}
                    title={mode.label}
                    class={cn(
                        "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all",
                        theme === mode.id
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                    )}
                >
                    <mode.icon size={14} />
                    <span class="hidden sm:inline">{mode.label}</span>
                </button>
            {/each}
        </div>
    </div>
</footer>

<script lang="ts">
    import { Search, Plus } from "@lucide/svelte";
    import { ALL_TIMEZONES } from "$lib/timezones";
    import { cn } from "$lib/utils";

    const ABBREVIATION_MAP: Record<string, string[]> = {
        pst: ["America/Los_Angeles"],
        pdt: ["America/Los_Angeles"],
        mst: ["America/Denver"],
        mdt: ["America/Denver"],
        cst: ["America/Chicago"],
        cdt: ["America/Chicago"],
        est: ["America/New_York"],
        edt: ["America/New_York"],
        gmt: ["Europe/London"],
        bst: ["Europe/London"],
        cet: [
            "Europe/Berlin",
            "Europe/Paris",
            "Europe/Rome",
            "Europe/Madrid",
            "Europe/Amsterdam",
        ],
        cest: [
            "Europe/Berlin",
            "Europe/Paris",
            "Europe/Rome",
            "Europe/Madrid",
            "Europe/Amsterdam",
        ],
        eet: ["Europe/Helsinki", "Europe/Bucharest", "Europe/Athens"],
        eest: ["Europe/Helsinki", "Europe/Bucharest", "Europe/Athens"],
        ist: ["Asia/Kolkata"],
        jst: ["Asia/Tokyo"],
        kst: ["Asia/Seoul"],
        cst_asia: ["Asia/Shanghai"],
        hkt: ["Asia/Hong_Kong"],
        sgt: ["Asia/Singapore"],
        aest: ["Australia/Sydney"],
        aedt: ["Australia/Sydney"],
        acst: ["Australia/Adelaide"],
        awst: ["Australia/Perth"],
        nzst: ["Pacific/Auckland"],
        nzdt: ["Pacific/Auckland"],
        hst: ["Pacific/Honolulu"],
        akst: ["America/Anchorage"],
        akdt: ["America/Anchorage"],
        wet: ["Europe/Lisbon"],
        west: ["Europe/Lisbon"],
        msk: ["Europe/Moscow"],
        ict: ["Asia/Bangkok"],
        wib: ["Asia/Jakarta"],
        pht: ["Asia/Manila"],
    };

    interface Props {
        onAdd: (tz: string) => void;
        existingTimezones: string[];
    }

    let { onAdd, existingTimezones }: Props = $props();

    let query = $state("");
    let open = $state(false);
    let highlightIndex = $state(-1);

    let containerEl: HTMLDivElement;
    let inputEl: HTMLInputElement;
    let listEl: HTMLDivElement | null = $state(null);

    let filtered = $derived(
        query.length > 0
            ? (() => {
                  const q = query.toLowerCase();
                  const abbrMatches = ABBREVIATION_MAP[q] || [];
                  return ALL_TIMEZONES.filter(
                      (tz) =>
                          !existingTimezones.includes(tz.name) &&
                          (tz.label.toLowerCase().includes(q) ||
                              tz.name.toLowerCase().includes(q) ||
                              tz.offset.toLowerCase().includes(q) ||
                              abbrMatches.includes(tz.name)),
                  ).slice(0, 50);
              })()
            : [],
    );

    // Reset highlight when results change
    $effect(() => {
        filtered;
        highlightIndex = -1;
    });

    // Scroll highlighted item into view
    $effect(() => {
        if (highlightIndex >= 0 && listEl) {
            const items = listEl.querySelectorAll("[data-tz-item]");
            items[highlightIndex]?.scrollIntoView({ block: "nearest" });
        }
    });

    // Global keyboard shortcut: / or Ctrl+K to focus search
    $effect(() => {
        function handleGlobalKey(e: KeyboardEvent) {
            const tag = (e.target as HTMLElement)?.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA") return;

            if (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) {
                e.preventDefault();
                inputEl?.focus();
            }
        }
        document.addEventListener("keydown", handleGlobalKey);
        return () => document.removeEventListener("keydown", handleGlobalKey);
    });

    // Close on outside click
    $effect(() => {
        function handleClick(e: MouseEvent) {
            if (containerEl && !containerEl.contains(e.target as Node)) {
                open = false;
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    });

    function selectItem(name: string) {
        onAdd(name);
        query = "";
        open = false;
        highlightIndex = -1;
    }

    function handleKeyDown(e: KeyboardEvent) {
        if (!open || filtered.length === 0) {
            if (e.key === "Escape") inputEl?.blur();
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                highlightIndex =
                    highlightIndex < filtered.length - 1
                        ? highlightIndex + 1
                        : 0;
                break;
            case "ArrowUp":
                e.preventDefault();
                highlightIndex =
                    highlightIndex > 0
                        ? highlightIndex - 1
                        : filtered.length - 1;
                break;
            case "Enter":
                e.preventDefault();
                if (highlightIndex >= 0 && highlightIndex < filtered.length) {
                    selectItem(filtered[highlightIndex].name);
                }
                break;
            case "Escape":
                e.preventDefault();
                open = false;
                highlightIndex = -1;
                inputEl?.blur();
                break;
        }
    }
</script>

<div class="relative" bind:this={containerEl}>
    <div
        class="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
    >
        <Search size={16} class="text-muted-foreground" />
        <input
            bind:this={inputEl}
            bind:value={query}
            type="text"
            placeholder="Search timezones... (/ to focus)"
            class="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            oninput={() => (open = true)}
            onfocus={() => {
                if (query.length > 0) open = true;
            }}
            onkeydown={handleKeyDown}
        />
        <kbd
            class="hidden text-[10px] text-muted-foreground sm:inline-block rounded border border-border bg-muted px-1.5 py-0.5 font-mono"
            >/</kbd
        >
    </div>

    {#if open && filtered.length > 0}
        <div
            bind:this={listEl}
            class="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border border-border bg-popover shadow-xl scrollbar-thin"
        >
            {#each filtered as tz, idx (tz.name)}
                <button
                    data-tz-item
                    class={cn("flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-secondary", {
                        "bg-secondary": idx === highlightIndex,
                    })}
                    onclick={() => selectItem(tz.name)}
                    onmouseenter={() => (highlightIndex = idx)}
                >
                    <Plus size={14} class="shrink-0 text-primary" />
                    <span class="flex-1 text-foreground">{tz.label}</span>
                    <span class="text-xs text-muted-foreground"
                        >{tz.offset}</span
                    >
                </button>
            {/each}
        </div>
    {/if}
</div>

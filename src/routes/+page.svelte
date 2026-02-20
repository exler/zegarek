<script lang="ts">
    import Header, { type TabType } from "$lib/components/Header.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import TimezoneRow from "$lib/components/TimezoneRow.svelte";
    import TimezoneSearch from "$lib/components/TimezoneSearch.svelte";
    import Stopwatch from "$lib/components/Stopwatch.svelte";
    import Timer from "$lib/components/Timer.svelte";
    import { DEFAULT_TIMEZONES, getOffsetHours } from "$lib/timezones";

    const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    let activeTab = $state<TabType>("timezones");
    let use24h = $state(true);
    let timezones = $state<string[]>(DEFAULT_TIMEZONES);
    // selectedDate: when user picks a time in any timezone, we store the
    // equivalent UTC Date. null = live/current time.
    let selectedDate = $state<Date | null>(null);
    // Live clock — updates every second when not pinned to a selected time
    let now = $state(new Date());
    // Drag state
    let draggedTz: string | null = null;

    let allTimezones = $derived([
        localTz,
        ...timezones.filter((tz) => tz !== localTz),
    ]);
    let baseDate = $derived(selectedDate ?? now);

    // Load from localStorage on mount
    $effect(() => {
        const saved = localStorage.getItem("timesync-zones");
        if (saved) timezones = JSON.parse(saved);
    });

    // Persist to localStorage
    $effect(() => {
        localStorage.setItem("timesync-zones", JSON.stringify(timezones));
    });

    // Live clock tick
    $effect(() => {
        if (!selectedDate) {
            const interval = setInterval(() => {
                now = new Date();
            }, 1000);
            return () => clearInterval(interval);
        }
    });

    function addTimezone(tz: string) {
        if (!timezones.includes(tz) && tz !== localTz) {
            timezones = [...timezones, tz];
        }
    }

    function removeTimezone(tz: string) {
        timezones = timezones.filter((t) => t !== tz);
    }

    // When a user selects an hour in a specific timezone, compute the
    // corresponding UTC date and store it so all rows reflect the same moment.
    function handleSelectHour(timezone: string, hour: number) {
        const base = selectedDate ?? new Date();
        const offsetH = getOffsetHours(timezone);
        const d = new Date(base);
        const currentMinute = parseInt(
            base.toLocaleString("en-US", {
                timeZone: timezone,
                minute: "numeric",
            }),
        );
        d.setUTCHours(Math.round(hour - offsetH), currentMinute, 0, 0);
        selectedDate = d;
    }

    function handleSelectMinute(timezone: string, minute: number) {
        const base = selectedDate ?? new Date();
        const offsetH = getOffsetHours(timezone);
        const currentHour = parseInt(
            base.toLocaleString("en-US", {
                timeZone: timezone,
                hour: "numeric",
                hour12: false,
            }),
            10
        );
        const d = new Date(base);
        d.setUTCHours(Math.round(currentHour - offsetH), minute, 0, 0);
        selectedDate = d;
    }

    function resetToNow() {
        selectedDate = null;
    }

    // Native HTML5 drag-and-drop reordering
    function handleDragStart(tz: string) {
        draggedTz = tz;
    }

    function handleDragOver(e: DragEvent) {
        e.preventDefault();
    }

    function handleDrop(targetTz: string) {
        if (
            !draggedTz ||
            draggedTz === targetTz ||
            draggedTz === localTz ||
            targetTz === localTz
        ) {
            draggedTz = null;
            return;
        }
        const oldIndex = timezones.indexOf(draggedTz);
        const newIndex = timezones.indexOf(targetTz);
        if (oldIndex === -1 || newIndex === -1) {
            draggedTz = null;
            return;
        }
        const reordered = [...timezones];
        reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, draggedTz);
        timezones = reordered;
        draggedTz = null;
    }
</script>

<div class="flex min-h-screen flex-col">
    <Header
        {activeTab}
        onTabChange={(tab) => (activeTab = tab)}
        {use24h}
        onToggleFormat={() => (use24h = !use24h)}
    />

    <main class="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {#if activeTab === "timezones"}
            <div class="space-y-3">
                <div class="flex items-center gap-3">
                    <div class="flex-1">
                        <TimezoneSearch
                            onAdd={addTimezone}
                            existingTimezones={[localTz, ...timezones]}
                        />
                    </div>
                    {#if selectedDate}
                        <button
                            onclick={resetToNow}
                            class="shrink-0 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                        >
                            Reset to Now
                        </button>
                    {/if}
                </div>

                <div class="space-y-2">
                    {#each allTimezones as tz (tz)}
                        <TimezoneRow
                            timezone={tz}
                            {use24h}
                            onRemove={removeTimezone}
                            isLocal={tz === localTz}
                            {baseDate}
                            onSelectHour={(hour) => handleSelectHour(tz, hour)}
                            onSelectMinute={(minute) =>
                                handleSelectMinute(tz, minute)}
                            ondragstart={() => handleDragStart(tz)}
                            ondragover={handleDragOver}
                            ondrop={() => handleDrop(tz)}
                        />
                    {/each}
                </div>
            </div>
        {:else if activeTab === "stopwatch"}
            <Stopwatch />
        {:else if activeTab === "timer"}
            <Timer />
        {/if}
    </main>

    <Footer />
</div>

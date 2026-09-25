/** Date/time helpers. Everything is local-time: a practice session belongs to
 *  the day the user experienced, not to UTC. */

export function formatSessionDate(iso: string): string {
    const date = new Date(iso);
    return date.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
}

export function formatSessionTime(iso: string): string {
    return new Date(iso).toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
    });
}

/** `"12m"`, `"1h 04m"`, or null while a session is still running. */
export function formatDuration(
    startedAt: string,
    endedAt: string | null
): string | null {
    if (!endedAt) return null;
    return formatElapsed(
        new Date(endedAt).getTime() - new Date(startedAt).getTime()
    );
}

export function formatElapsed(ms: number): string {
    const totalMinutes = Math.max(0, Math.floor(ms / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}

/** `2026-09-25` in LOCAL time — the key the calendar groups sessions by. */
export function localDayKey(iso: string | Date): string {
    const date = typeof iso === 'string' ? new Date(iso) : iso;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
}

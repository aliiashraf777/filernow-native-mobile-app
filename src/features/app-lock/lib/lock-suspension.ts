// nativeApp\src\features\app-lock\lib\lock-suspension.ts

let running = 0;
let graceUntil = 0;

/** True while a system screen (folder picker etc.) is open, so the app must not auto-lock. */
export const isLockSuspended = () => running > 0 || Date.now() < graceUntil;

/** Runs a task that sends the app to the background without locking it. */
export async function suspendLockWhile<T>(task: () => Promise<T>): Promise<T> {
    running++;
    try {
        return await task();
    } finally {
        running--;
        // AppState "active" can fire just AFTER the picker promise resolves, so keep the pause briefly
        graceUntil = Date.now() + 3000;
    }
}
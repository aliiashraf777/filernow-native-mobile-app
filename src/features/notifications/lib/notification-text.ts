// nativeApp\src\features\notifications\lib\notification-text.ts

import i18n from "@/i18n";

import type { INotification } from "../data/notifications";

/**
 * Title and body to show. The demo feed is translated by id (notifications:demo.<id>);
 * anything else (e.g. from the backend later) is shown as sent.
 */
export function notificationText(item: Pick<INotification, "id" | "title" | "body">) {
    const key = `notifications:demo.${item.id}`;
    if (!i18n.exists(`${key}.title`)) return { title: item.title, body: item.body };
    // the key is checked at runtime above, so the dynamic id is safe here
    const t = i18n.t as (key: string) => string;
    return { title: t(`${key}.title`), body: t(`${key}.body`) };
}

// nativeApp\src\features\khata\lib\share-file.ts

import { File, Paths } from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

export const MIME = {
    csv: { mimeType: "text/csv", UTI: "public.comma-separated-values-text" },
    xlsx: {
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        UTI: "org.openxmlformats.spreadsheetml.sheet",
    },
    pdf: { mimeType: "application/pdf", UTI: "com.adobe.pdf" },
} as const;

type Mime = (typeof MIME)[keyof typeof MIME];

async function openShare(uri: string, { mimeType, UTI }: Mime) {
    if (!(await Sharing.isAvailableAsync())) throw new Error("Sharing is not available on this device");
    await Sharing.shareAsync(uri, { mimeType, UTI, dialogTitle: "Share karein" });
}

/** Writes text/bytes to the cache folder and opens the system share sheet. */
export async function shareBytes(name: string, content: string | Uint8Array, type: Mime) {
    const file = new File(Paths.cache, name);
    if (file.exists) file.delete();
    file.create();
    await file.write(content);
    await openShare(file.uri, type);
}

/** Renders HTML to a PDF and opens the system share sheet. */
export async function sharePdf(html: string, name: string) {
    const { uri } = await Print.printToFileAsync({ html });
    let shareUri = uri;
    try {
        // readable file name; fall back to the generated one if copying fails
        const named = new File(Paths.cache, name);
        if (named.exists) named.delete();
        new File(uri).copy(named);
        shareUri = named.uri;
    } catch {
        shareUri = uri;
    }
    await openShare(shareUri, MIME.pdf);
}
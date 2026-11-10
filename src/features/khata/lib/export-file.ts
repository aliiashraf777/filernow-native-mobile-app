// nativeApp\src\features\khata\lib\export-file.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Directory, File, Paths } from "expo-file-system";

import { suspendLockWhile } from "@/features/app-lock/lib/lock-suspension";

export const MIME = {
    pdf: "application/pdf",
    csv: "text/csv",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
} as const;

// iOS share sheet needs a UTI as well as a MIME type
const UTI: Record<string, string> = {
    [MIME.pdf]: "com.adobe.pdf",
    [MIME.csv]: "public.comma-separated-values-text",
    [MIME.xlsx]: "org.openxmlformats.spreadsheetml.sheet",
};

export type DeliverMode = "save" | "share";
export type DeliverResult = "saved" | "shared" | "cancelled";
type Data = string | Uint8Array;

const DIR_KEY = "khata-export-dir";
const isCancel = (e: unknown) => /cancel/i.test(e instanceof Error ? e.message : String(e));

function base64ToBytes(b64: string) {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
}

/* ------------------------------ SAVE ------------------------------ */
/**
 * "Download": writes a real copy into a folder the user picked once.
 * The folder is remembered, so later exports save with no picker (and no trip to the background).
 * If the remembered folder stops working (permission revoked, folder deleted), we ask again.
 */
async function saveCopy(data: Data, name: string, mime: string): Promise<DeliverResult> {
    const savedUri = await AsyncStorage.getItem(DIR_KEY);
    if (savedUri) {
        try {
            new Directory(savedUri).createFile(name, mime).write(data);
            return "saved";
        } catch {
            await AsyncStorage.removeItem(DIR_KEY);
        }
    }

    let dir: Directory;
    try {
        // the picker backgrounds the app: pause the PIN auto-lock meanwhile
        dir = await suspendLockWhile(() => Directory.pickDirectoryAsync());
    } catch (e) {
        if (isCancel(e)) return "cancelled";
        throw e;
    }
    dir.createFile(name, mime).write(data);
    await AsyncStorage.setItem(DIR_KEY, dir.uri);
    return "saved";
}

/* ------------------------------ SHARE ------------------------------ */
async function shareCopy(data: Data, name: string, mime: string): Promise<DeliverResult> {
    // sharing needs a file on disk, under the real name
    const file = new File(Paths.cache, name);
    if (file.exists) file.delete();
    file.create();
    file.write(data);

    if (!(await Sharing.isAvailableAsync())) throw new Error("Sharing is not available on this device");
    await suspendLockWhile(() => Sharing.shareAsync(file.uri, { mimeType: mime, UTI: UTI[mime], dialogTitle: name }));
    return "shared";
}

/* ------------------------------ PUBLIC ------------------------------ */
export async function deliverFile(
    { name, mime, data }: { name: string; mime: string; data: Data },
    mode: DeliverMode = "share",
): Promise<DeliverResult> {
    return mode === "save" ? saveCopy(data, name, mime) : shareCopy(data, name, mime);
}

export async function deliverPdf(html: string, name: string, mode: DeliverMode = "share") {
    // base64: we never read expo-print's own temp file (Expo Go blocks that, which broke the old copy step).
    // A4 in points.
    const { base64 } = await Print.printToFileAsync({ html, width: 595, height: 842, base64: true });
    if (!base64) throw new Error("PDF generation returned no data");
    return deliverFile({ name, mime: MIME.pdf, data: base64ToBytes(base64) }, mode);
}
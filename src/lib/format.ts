import { format } from "date-fns";

export function formatSeminarWhen(iso: string) {
  try {
    return format(new Date(iso), "EEE · d MMM · h:mm a");
  } catch {
    return iso;
  }
}

export function formatShortDate(iso: string) {
  try {
    return format(new Date(iso), "d MMM yyyy");
  } catch {
    return iso;
  }
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

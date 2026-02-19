
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { API_URL } from "./api"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAssetUrl(path: string | undefined | null): string {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('blob:')) return path;
  if (path.startsWith('/')) return `${API_URL}${path}`;
  return `${API_URL}/${path}`;
}

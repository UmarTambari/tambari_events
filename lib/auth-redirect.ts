/**
 * Validates values from `?redirect=` (or similar) so we only navigate to same-origin paths.
 */
export function sanitizePostAuthRedirect(raw: string | null): string | null {
  if (raw == null || raw === "") return null;
  let path: string;
  try {
    path = decodeURIComponent(raw);
  } catch {
    return null;
  }
  const t = path.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return null;
  if (t.includes("://")) return null;
  if (t.includes("\\")) return null;
  return t;
}

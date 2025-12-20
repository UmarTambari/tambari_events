export function generateSlug(input: string): string {
  if (!input) return "";

  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")                    // Handle accents (é → e)
    .replace(/[\u0300-\u036f]/g, "")    // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "")       // Remove special chars except space & hyphen
    .replace(/\s+/g, "-")               // Spaces → hyphens
    .replace(/-+/g, "-")                // Collapse multiple hyphens
    .replace(/^-+|-+$/g, "");           // Trim hyphens from start/end
}
export type SearchParams = Record<string, string | string[] | undefined>;

/** Repeated query keys (`?q=a&q=b`) arrive as arrays; pages only need the first. */
export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

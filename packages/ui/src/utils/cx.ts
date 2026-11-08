export type ClassValue = string | false | null | undefined;

export const cx = (...values: ClassValue[]): string | undefined => {
  const joined = values.filter(Boolean).join(" ");
  return joined.length > 0 ? joined : undefined;
};

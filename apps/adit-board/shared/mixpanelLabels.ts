/**
 * Date labels for Mixpanel numbers, shared by the Mixpanel page and the payment side panel. Kept
 * out of MixpanelPage.tsx so that file exports only its component, which lets a saved chart file
 * update the page in place instead of reloading it.
 */
export const syncedLabel = (iso: string) =>
  new Date(iso).toLocaleString("en", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

export const rangeLabel = (from: string, to: string) => {
  const m = (iso: string) => new Date(iso).toLocaleString("en", { month: "short", year: "numeric" });
  return `${m(from)} – ${m(to)}`;
};

/** A Mixpanel link and nothing else: https, on mixpanel.com, no spaces, so it is safe to quote in a brief. */
export const isMixpanelLink = (text: string) => {
  if (text.length > 2000 || /\s/.test(text)) return false;
  try {
    const url = new URL(text);
    return url.protocol === "https:" && (url.hostname === "mixpanel.com" || url.hostname.endsWith(".mixpanel.com"));
  } catch {
    return false;
  }
};

/**
 * An unsaved query's link: a report page whose hash is only Mixpanel's short code
 * (`…/app/insights#vbP3CFPAnoXh`). No Mixpanel tool can read one; a saved report's link
 * carries its ID (`…/app/funnels/#view/89004097`).
 */
export const isUnsavedQuery = (text: string) => {
  try {
    const url = new URL(text);
    return /\/app\/(insights|funnels|flows|retention)\/?$/.test(url.pathname) && /^#(?=.*[A-Za-z])[A-Za-z0-9]{6,20}$/.test(url.hash);
  } catch {
    return false;
  }
};

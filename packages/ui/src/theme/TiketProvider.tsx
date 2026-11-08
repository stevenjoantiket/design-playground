import { createContext, useContext, type ReactNode } from "react";
import type { PlatformName, ThemeName } from "@tiket-ds/tokens";

export interface TiketTheme {
  theme: ThemeName;
  platform: PlatformName;
}

const TiketThemeContext = createContext<TiketTheme>({
  theme: "light",
  platform: "mobile",
});

export const useTiketTheme = (): TiketTheme => useContext(TiketThemeContext);

export interface TiketProviderProps extends Partial<TiketTheme> {
  children: ReactNode;
  /**
   * Render as a plain wrapper instead of a `<div>`. Useful when the provider sits at
   * the document root and the attributes belong on `<html>` — in that case set them
   * yourself and pass `asChild`.
   */
  asChild?: boolean;
  className?: string;
}

/**
 * Publishes theme and platform as data attributes. The token CSS keys off
 * `[data-tds-theme]` and `[data-tds-platform]`, so nothing needs to re-render for a
 * theme switch — the custom properties cascade.
 *
 * Platform changes density and minimum hit target only. Colors and type are identical
 * across mobile, desktop and dashboard.
 */
export function TiketProvider({
  theme = "light",
  platform = "mobile",
  asChild = false,
  className,
  children,
}: TiketProviderProps) {
  const value: TiketTheme = { theme, platform };

  return (
    <TiketThemeContext.Provider value={value}>
      {asChild ? (
        children
      ) : (
        <div data-tds-theme={theme} data-tds-platform={platform} className={className}>
          {children}
        </div>
      )}
    </TiketThemeContext.Provider>
  );
}

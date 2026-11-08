import figma from "@figma/code-connect";

import { Button } from "./Button.js";

/*
 * Figma's `State` axis becomes real DOM state rather than a prop:
 * `01 Enabled` is the default, `02 Pressed` is :active and has no code equivalent,
 * `03 Loading` maps to `loading`, `04 Disabled` maps to `disabled`.
 */
const shared = {
  size: figma.enum("Size", {
    Large: "large",
    Medium: "medium",
    Small: "small",
  } as const),
  loading: figma.enum("State", { "03 Loading": true } as const),
  disabled: figma.enum("State", { "04 Disabled": true } as const),
  startIcon: figma.boolean("Show Icon", {
    true: figma.instance("Select Icon"),
    false: undefined,
  }),
  children: figma.string("Input Text"),
};

figma.connect(Button, "<TDS>?node-id=1-1662", {
  props: shared,
  example: ({ size, loading, disabled, startIcon, children }) => (
    <Button variant="primary" size={size} loading={loading} disabled={disabled} startIcon={startIcon}>
      {children}
    </Button>
  ),
});

figma.connect(Button, "<TDS>?node-id=1-1705", {
  props: shared,
  example: ({ size, loading, disabled, startIcon, children }) => (
    <Button variant="secondary" size={size} loading={loading} disabled={disabled} startIcon={startIcon}>
      {children}
    </Button>
  ),
});

figma.connect(Button, "<TDS>?node-id=1-1748", {
  props: shared,
  example: ({ size, loading, disabled, startIcon, children }) => (
    <Button variant="tertiary" size={size} loading={loading} disabled={disabled} startIcon={startIcon}>
      {children}
    </Button>
  ),
});

figma.connect(Button, "<TDS>?node-id=1-1791", {
  props: shared,
  example: ({ size, loading, disabled, startIcon, children }) => (
    <Button variant="invert" size={size} loading={loading} disabled={disabled} startIcon={startIcon}>
      {children}
    </Button>
  ),
});

figma.connect(Button, "<TDS>?node-id=1-1834", {
  props: shared,
  example: ({ size, loading, disabled, startIcon, children }) => (
    <Button variant="alert" size={size} loading={loading} disabled={disabled} startIcon={startIcon}>
      {children}
    </Button>
  ),
});

/* The alert set again in `[SSoT] NFT`, which is where the button page lives. */
figma.connect(Button, "<NFT>?node-id=408-19467", {
  props: shared,
  example: ({ size, loading, disabled, startIcon, children }) => (
    <Button variant="alert" size={size} loading={loading} disabled={disabled} startIcon={startIcon}>
      {children}
    </Button>
  ),
});

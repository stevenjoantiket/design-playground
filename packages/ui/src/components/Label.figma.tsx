import figma from "@figma/code-connect";

import { Label } from "./Label.js";

/*
 * Every tone is its own component in Figma, so the tone is part of which node you mapped
 * and never a Figma property. Only Red is mapped for Primary and Ribbon, which is all the
 * `<TDS>` copy publishes; the Secondary and Multi sets below live in the second copy and do
 * publish every tone, one mapping each.
 */
figma.connect(Label, "<TDS>?node-id=1-3465", {
  props: {
    size: figma.enum("Size", { Medium: "medium", Small: "small" } as const),
    children: figma.string("Input Text"),
  },
  example: ({ size, children }) => (
    <Label kind="primary" tone="red" size={size}>
      {children}
    </Label>
  ),
});

figma.connect(Label, "<TDS>?node-id=1-3450", {
  props: {
    gradient: figma.enum("Gradient", { True: true, False: false } as const),
    children: figma.string("Input Text"),
  },
  example: ({ gradient, children }) => (
    <Label kind="ribbon" tone="red" gradient={gradient}>
      {children}
    </Label>
  ),
});

/*
 * Secondary and Multi, one mapping per tone. Spelled out rather than generated in a loop:
 * the Code Connect parser reads these statically, so the node URL has to be a literal.
 *
 * `Show Icon`, `Show Text` and `Show Countdown` are whether a slot is filled, so they are
 * the props being passed rather than booleans of their own.
 */
const secondary = {
  gradient: figma.enum("Gradient", { True: true, False: false } as const),
  iconSize: figma.enum("Icon Size", { "16px": 16, "12px": 12 } as const),
  startIcon: figma.instance("Select Icon"),
  children: figma.string("Input Text"),
};

figma.connect(Label, "<TDS-2>?node-id=55549-1323", {
  props: secondary,
  example: ({ gradient, iconSize, startIcon, children }) => (
    <Label
      kind="secondary"
      tone="red"
      gradient={gradient}
      iconSize={iconSize}
      startIcon={startIcon}
      countdown="23:59:59.9"
    >
      {children}
    </Label>
  ),
});

figma.connect(Label, "<TDS-2>?node-id=55549-1344", {
  props: secondary,
  example: ({ gradient, iconSize, startIcon, children }) => (
    <Label
      kind="secondary"
      tone="green"
      gradient={gradient}
      iconSize={iconSize}
      startIcon={startIcon}
      countdown="23:59:59.9"
    >
      {children}
    </Label>
  ),
});

figma.connect(Label, "<TDS-2>?node-id=55549-1365", {
  props: secondary,
  example: ({ gradient, iconSize, startIcon, children }) => (
    <Label
      kind="secondary"
      tone="blue"
      gradient={gradient}
      iconSize={iconSize}
      startIcon={startIcon}
      countdown="23:59:59.9"
    >
      {children}
    </Label>
  ),
});

figma.connect(Label, "<TDS-2>?node-id=55549-1386", {
  props: secondary,
  example: ({ gradient, iconSize, startIcon, children }) => (
    <Label
      kind="secondary"
      tone="orange"
      gradient={gradient}
      iconSize={iconSize}
      startIcon={startIcon}
      countdown="23:59:59.9"
    >
      {children}
    </Label>
  ),
});

/* Violet has no Gradient property because it has no solid fill. */
figma.connect(Label, "<TDS-2>?node-id=55549-1304", {
  props: {
    iconSize: figma.enum("Icon Size", { "16px": 16, "12px": 12 } as const),
    startIcon: figma.instance("Select Icon"),
    children: figma.string("Input Text"),
  },
  example: ({ iconSize, startIcon, children }) => (
    <Label kind="secondary" tone="violet" iconSize={iconSize} startIcon={startIcon}>
      {children}
    </Label>
  ),
});

const multi = {
  gradient: figma.enum("Gradient", { True: true, False: false } as const),
  startIcon: figma.instance("Select Icon 1"),
  children: figma.string("Input Text"),
  extra: figma.string("Input Percentage Text"),
};

/* Red is published in both copies of the library; the other tones only in the second. */
figma.connect(Label, "<TDS>?node-id=1-3472", {
  props: multi,
  example: ({ gradient, startIcon, children, extra }) => (
    <Label
      kind="multi"
      tone="red"
      gradient={gradient}
      startIcon={startIcon}
      countdown="23:59:59.9"
      extra={extra}
    >
      {children}
    </Label>
  ),
});

figma.connect(Label, "<TDS-2>?node-id=55549-1426", {
  props: multi,
  example: ({ gradient, startIcon, children, extra }) => (
    <Label
      kind="multi"
      tone="green"
      gradient={gradient}
      startIcon={startIcon}
      countdown="23:59:59.9"
      extra={extra}
    >
      {children}
    </Label>
  ),
});

figma.connect(Label, "<TDS-2>?node-id=55549-1445", {
  props: multi,
  example: ({ gradient, startIcon, children, extra }) => (
    <Label
      kind="multi"
      tone="blue"
      gradient={gradient}
      startIcon={startIcon}
      countdown="23:59:59.9"
      extra={extra}
    >
      {children}
    </Label>
  ),
});

figma.connect(Label, "<TDS-2>?node-id=55549-1464", {
  props: multi,
  example: ({ gradient, startIcon, children, extra }) => (
    <Label
      kind="multi"
      tone="orange"
      gradient={gradient}
      startIcon={startIcon}
      countdown="23:59:59.9"
      extra={extra}
    >
      {children}
    </Label>
  ),
});

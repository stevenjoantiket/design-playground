import figma from "@figma/code-connect";

import { Chip } from "./Chip.js";

// `Disabled` is not a `state` value in code — it is the disabled attribute.
const state = figma.enum("State", {
  Inactive: "inactive",
  Active: "active",
  Error: "error",
} as const);

const disabled = figma.enum("State", { Disabled: true } as const);

figma.connect(Chip, "<TDS>?node-id=1-2662", {
  props: {
    state,
    disabled,
    startIcon: figma.boolean("Show Left Icon", {
      true: figma.instance("Select Left Icon"),
      false: undefined,
    }),
    children: figma.string("Input Text"),
  },
  example: ({ state: s, disabled: d, startIcon, children }) => (
    <Chip kind="general" state={s} disabled={d} startIcon={startIcon}>
      {children}
    </Chip>
  ),
});

figma.connect(Chip, "<TDS>?node-id=1-2641", {
  props: {
    state,
    disabled,
    children: figma.string("Input Text"),
    description: figma.string("Input Subtext"),
  },
  example: ({ state: s, disabled: d, children, description }) => (
    <Chip kind="description" state={s} disabled={d} description={description}>
      {children}
    </Chip>
  ),
});

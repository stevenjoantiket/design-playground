import figma from "@figma/code-connect";

import { Button } from "./Button.js";
import { ButtonGroup } from "./ButtonGroup.js";

const sticky = figma.enum("Sticky", { True: true, False: false } as const);

figma.connect(ButtonGroup, "<TDS>?node-id=1-1877", {
  props: { sticky },
  example: ({ sticky: isSticky }) => (
    <ButtonGroup layout="stacked" sticky={isSticky}>
      <Button>Primary action</Button>
      <Button variant="tertiary">Secondary action</Button>
    </ButtonGroup>
  ),
});

figma.connect(ButtonGroup, "<TDS>?node-id=1-1888", {
  props: { sticky },
  example: ({ sticky: isSticky }) => (
    <ButtonGroup layout="sideBySide" sticky={isSticky}>
      <Button variant="secondary">Back</Button>
      <Button>Next</Button>
    </ButtonGroup>
  ),
});

/*
 * The same two sets in `[SSoT] NFT`, where `Show Inset` is a property: a sticky group is
 * the last thing above the home indicator, so it is the one that draws it.
 */
const showInset = figma.boolean("Show Inset");

figma.connect(ButtonGroup, "<NFT>?node-id=408-19510", {
  props: { sticky, showInset, showButton1: figma.boolean("Show Button 1") },
  example: ({ sticky: isSticky, showInset: inset, showButton1 }) => (
    <ButtonGroup layout="stacked" sticky={isSticky} homeIndicator={inset}>
      {showButton1 ? (
        <Button variant="secondary" fullWidth>
          Secondary button
        </Button>
      ) : null}
      <Button fullWidth>Primary button</Button>
    </ButtonGroup>
  ),
});

figma.connect(ButtonGroup, "<NFT>?node-id=408-19521", {
  props: { sticky, showInset },
  example: ({ sticky: isSticky, showInset: inset }) => (
    <ButtonGroup layout="sideBySide" sticky={isSticky} homeIndicator={inset}>
      <Button variant="secondary">Sec Button</Button>
      <Button>Primary button</Button>
    </ButtonGroup>
  ),
});

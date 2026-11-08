import figma from "@figma/code-connect";

import { Button } from "./Button.js";
import { ButtonGroup } from "./ButtonGroup.js";
import { View } from "./View.js";

/*
 * Two Figma components, one variant apart. The image is an `Image Placeholder` instance in
 * both, so it maps as an instance and the snippet shows whatever was swapped in.
 */

figma.connect(View, "<TDS-2>?node-id=55549-1204", {
  props: {
    media: figma.instance("Image"),
    title: figma.string("Input Title Text"),
    subtext: figma.string("Input Subtext"),
  },
  example: ({ media, title, subtext }) => (
    <View
      media={media}
      title={title}
      subtext={subtext}
      actions={
        <ButtonGroup layout="stacked">
          <Button variant="secondary">Secondary button</Button>
          <Button>Primary button</Button>
        </ButtonGroup>
      }
    />
  ),
});

figma.connect(View, "<TDS-2>?node-id=55549-1203", {
  props: {
    media: figma.instance("Image"),
    title: figma.string("Input Title Text"),
    subtext: figma.string("Input Subtext"),
  },
  example: ({ media, title, subtext }) => (
    <View
      variant="section"
      media={media}
      title={title}
      subtext={subtext}
      actions={<Button size="small">Primary button</Button>}
    />
  ),
});

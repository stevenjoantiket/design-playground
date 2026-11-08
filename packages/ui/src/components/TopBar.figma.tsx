import figma from "@figma/code-connect";

import { Button } from "./Button.js";
import { SearchBox } from "./SearchBox.js";
import { StatusBar } from "./StatusBar.js";
import { Text } from "./Text.js";
import { TopBar } from "./TopBar.js";

/*
 * Fourteen Figma sets, one component. Each mapping is the slot combination that set draws,
 * so the snippet a designer copies is the bar already arranged — not an empty `<TopBar />`.
 *
 * `State = Scrolling` stays a prop instead of becoming a second mapping: it is the same
 * arrangement with an elevation, and on Extended with the title moved up a row.
 *
 * The back arrow is not in any example. It is a fixed `tds_ic_back` node rather than a
 * swappable slot, and the `tds_ic_*` library is not part of this export — the app supplies
 * the glyph, as it does for `SearchBox`.
 */

const scrollingState = figma.enum("State", { Scrolling: true, Initial: false } as const);
const scrollingType = figma.enum("Type", { Scrolling: true, Initial: false } as const);

/** The trailing icon cluster: three slots, the last two optional. */
const icons = {
  icon1: figma.instance("Select Icon 1"),
  icon2: figma.instance("Select Icon 2"),
  icon3: figma.instance("Select Icon 3"),
};

/* 01 Logo + Images + Icons */
figma.connect(TopBar, "<TDS-2>?node-id=55549-2462", {
  props: { scrolling: scrollingState, ...icons },
  example: ({ scrolling, icon1, icon2, icon3 }) => (
    <TopBar
      scrolling={scrolling}
      actions={
        <>
          {icon3}
          {icon2}
          {icon1}
        </>
      }
    />
  ),
});

/* 02 Back + Title + Icons */
figma.connect(TopBar, "<TDS-2>?node-id=55549-2202", {
  props: { scrolling: scrollingState, title: figma.string("Input Title Text"), ...icons },
  example: ({ scrolling, title, icon1, icon2, icon3 }) => (
    <TopBar
      scrolling={scrolling}
      title={title}
      actions={
        <>
          {icon3}
          {icon2}
          {icon1}
        </>
      }
    />
  ),
});

/* 03 Big Title + Icons — no back arrow, the title carries the row. */
figma.connect(TopBar, "<TDS-2>?node-id=55549-2240", {
  props: { scrolling: scrollingState, title: figma.string("Input Title Text"), ...icons },
  example: ({ scrolling, title, icon1 }) => (
    <TopBar scrolling={scrolling} title={title} actions={icon1} />
  ),
});

/* 04 Back + Title + Link */
figma.connect(TopBar, "<TDS-2>?node-id=55549-2225", {
  props: { scrolling: scrollingState, title: figma.string("Input Title Text") },
  example: ({ scrolling, title }) => (
    <TopBar
      scrolling={scrolling}
      title={title}
      actions={
        <Text as="span" variant="body2Bold" color="active">
          Text Link
        </Text>
      }
    />
  ),
});

/* 05 Back + Image + Title + Subtitle + Icons */
figma.connect(TopBar, "<TDS-2>?node-id=55549-2404", {
  props: {
    scrolling: scrollingState,
    title: figma.string("Input Title Text"),
    subtitle: figma.string("Input Subtitle Text"),
    media: figma.instance("Image"),
    ...icons,
  },
  example: ({ scrolling, title, subtitle, media, icon1 }) => (
    <TopBar
      scrolling={scrolling}
      media={media}
      title={title}
      subtitle={subtitle}
      actions={icon1}
    />
  ),
});

/* 06 Back + Title + Subtitle + Button */
figma.connect(TopBar, "<TDS-2>?node-id=55549-2433", {
  props: {
    scrolling: scrollingState,
    title: figma.string("Input Title Text"),
    subtitle: figma.string("Input Subtitle Text"),
  },
  example: ({ scrolling, title, subtitle }) => (
    <TopBar
      scrolling={scrolling}
      title={title}
      subtitle={subtitle}
      actions={<Button size="small">Button</Button>}
    />
  ),
});

/* 07 Back + Searchbox */
figma.connect(TopBar, "<TDS-2>?node-id=55549-2257", {
  props: { scrolling: scrollingType },
  example: ({ scrolling }) => (
    <TopBar scrolling={scrolling} search={<SearchBox size="small" placeholder="Search Box" />} />
  ),
});

/*
 * 08 Transparant Icons and 09 Transparant Searchbox, on the nodes the inventory recorded —
 * both sets are published in both copies of the library.
 *
 * These two are the only sets whose frame the status bar is worth passing: they have no
 * surface of their own, so the phone behind them is the point. Everywhere else the slot is
 * left empty and a screen renders nothing.
 */
figma.connect(TopBar, "<TDS>?node-id=1-3677", {
  props: { scrolling: scrollingState, ...icons },
  example: ({ scrolling, icon1 }) => (
    <TopBar transparent scrolling={scrolling} actions={icon1} />
  ),
});

figma.connect(TopBar, "<TDS>?node-id=1-3657", {
  props: { scrolling: scrollingType },
  example: ({ scrolling }) => (
    <TopBar
      transparent
      scrolling={scrolling}
      search={<SearchBox size="small" placeholder="Search Box" />}
    />
  ),
});

/*
 * The same two sets in `[SSoT] NFT`, where the frame draws the status bar as well and its
 * glyphs are white until the bar scrolls onto a surface. `Select Icon Left` is a real slot
 * on 08, unlike the fixed back arrow on 09.
 */
figma.connect(TopBar, "<NFT>?node-id=408-18049", {
  props: {
    scrolling: scrollingState,
    leading: figma.instance("Select Icon Left"),
    ...icons,
  },
  example: ({ scrolling, leading, icon1, icon2, icon3 }) => (
    <TopBar
      transparent
      scrolling={scrolling}
      statusBar={<StatusBar dynamicIsland={false} invert={!scrolling} />}
      leading={leading}
      actions={
        <>
          {icon3}
          {icon2}
          {icon1}
        </>
      }
    />
  ),
});

figma.connect(TopBar, "<NFT>?node-id=408-18029", {
  props: { scrolling: scrollingType, ...icons },
  example: ({ scrolling, icon1, icon2 }) => (
    <TopBar
      transparent
      scrolling={scrolling}
      statusBar={<StatusBar dynamicIsland={false} invert={!scrolling} />}
      search={<SearchBox size="small" placeholder="Search Box" />}
      actions={
        <>
          {icon2}
          {icon1}
        </>
      }
    />
  ),
});

/* 02 Extended - 01 Back + Title + Icons */
figma.connect(TopBar, "<TDS>?node-id=1-3698", {
  props: { scrolling: scrollingState, title: figma.string("Input Title Text"), ...icons },
  example: ({ scrolling, title, icon1 }) => (
    <TopBar variant="extended" scrolling={scrolling} title={title} actions={icon1} />
  ),
});

/* 02 Extended - 02 Back + Title + Link. Figma names this set's property `Initial`. */
figma.connect(TopBar, "<TDS-2>?node-id=55549-2331", {
  props: {
    scrolling: figma.enum("Initial", { Scrolling: true, Initial: false } as const),
    title: figma.string("Input Title Text"),
  },
  example: ({ scrolling, title }) => (
    <TopBar
      variant="extended"
      scrolling={scrolling}
      title={title}
      actions={
        <Text as="span" variant="body2Bold" color="active">
          Text Link
        </Text>
      }
    />
  ),
});

/* 02 Extended - 03 Back + Searchbox + Icons */
figma.connect(TopBar, "<TDS-2>?node-id=55549-2347", {
  props: { scrolling: scrollingState, ...icons },
  example: ({ scrolling, icon1 }) => (
    <TopBar
      variant="extended"
      scrolling={scrolling}
      search={<SearchBox size="small" placeholder="Search Box" />}
      actions={icon1}
    />
  ),
});

/* 02 Extended - 04 Back + Searchbox + Link */
figma.connect(TopBar, "<TDS-2>?node-id=55549-2387", {
  props: { scrolling: scrollingState },
  example: ({ scrolling }) => (
    <TopBar
      variant="extended"
      scrolling={scrolling}
      search={<SearchBox size="small" placeholder="Search Box" />}
      actions={
        <Text as="span" variant="body2Bold" color="active">
          Text Link
        </Text>
      }
    />
  ),
});

/* 02 Extended - 05 Back + Searchbox + Title */
figma.connect(TopBar, "<TDS-2>?node-id=55549-2370", {
  props: { scrolling: scrollingState, title: figma.string("Input Title Text") },
  example: ({ scrolling, title }) => (
    <TopBar
      variant="extended"
      scrolling={scrolling}
      title={title}
      search={<SearchBox size="small" placeholder="Search Box" />}
    />
  ),
});

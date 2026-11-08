import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  Badge,
  BottomAppBar,
  BottomNav,
  BottomSheet,
  Button,
  ButtonGroup,
  Calendar,
  CalendarBottomBar,
  CalendarLegend,
  CalendarSummary,
  CalendarSummaryItem,
  Chip,
  Divider,
  Dropdown,
  Label,
  Pagination,
  ProgressStep,
  QuantityEditor,
  QuantityStepButton,
  Radio,
  SearchBox,
  SearchForm,
  SearchFormField,
  SearchFormPiece,
  SearchFormSwapButton,
  SegmentedControl,
  SlideButton,
  Slider,
  Snackbar,
  StatusBar,
  Tabs,
  Text,
  TextField,
  TiketProvider,
  Toggle,
  Tooltip,
  TopBar,
  View,
  WheelPicker,
  type CalendarEntry,
  type CalendarRange,
} from "@tiket-ds/ui";
import {
  blue,
  green,
  gradients,
  magenta,
  motion,
  neutral,
  orange,
  purple,
  red,
  turquoise,
  typography,
  yellow,
  type PlatformName,
  type ThemeName,
} from "@tiket-ds/tokens";

import { AnchorRoot, Contents, Example, Section, Variant, useAnchorTarget } from "./anchors.js";
import { DESIGN_SYSTEM_PAGES } from "../shared/projects.js";
import { MotionView } from "./hero-motion.js";
import { SearchIcon, CloseIcon, LibraryIcon, type GlyphName } from "./icons.js";
import { ICONS, matchesQuery } from "./icon-library.js";

const BUTTON_VARIANTS = ["primary", "secondary", "tertiary", "invert", "alert"] as const;
const BUTTON_SIZES = ["large", "medium", "small"] as const;

/** Enough of a date wheel to show what the picker sheet does with three columns. */
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** Enough steps to overflow a phone, which is what the progress strip is built for. */
const PROGRESS_STEPS = [
  { label: "Progress Title" },
  { label: "Progress Title" },
  { label: "Progress Title" },
  { label: "Progress Title" },
  { label: "Final Step", final: true },
] as const;

/** The three Figma states are these three scroll positions. */
const PROGRESS_STATES = [
  { name: "Start", step: 0 },
  { name: "Middle", step: 2 },
  { name: "Final", step: 4 },
] as const;

const BOTTOM_NAV = [
  { icon: "homeOn", label: "Home" },
  { icon: "search", label: "Search" },
  { icon: "promo", label: "Promo" },
  { icon: "orderHistory", label: "Orders" },
  { icon: "profileOff", label: "Account" },
] as const satisfies readonly { icon: GlyphName; label: string }[];

/*
 * A fare calendar to fill the picker with. Fixed to June 2026 so the "Today" caption, the
 * greyed-out past and the cheap days land where Figma's frames show them, whenever the page
 * is opened.
 */
const CALENDAR_TODAY = "2026-06-05";

const CALENDAR_HOLIDAYS: Record<string, string> = {
  "2026-06-01": "Labor day",
  "2026-06-07": "Vesak day",
  "2026-06-21": "Ascension day",
  "2026-07-17": "Independence day",
};

const DATE_ENTRIES: Record<string, CalendarEntry> = {};
for (let month = 6; month <= 12; month += 1) {
  const length = new Date(Date.UTC(2026, month, 0)).getUTCDate();
  for (let day = 1; day <= length; day += 1) {
    const key = `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const fare = 750 + ((day * 37 + month * 23) % 9) * 50;
    DATE_ENTRIES[key] = {
      price: `${fare}K`,
      cheapest: fare <= 800,
      soldOut: day % 17 === 0,
      holiday: CALENDAR_HOLIDAYS[key],
    };
  }
}

const MONTH_ENTRIES: Record<string, CalendarEntry> = {};
for (let year = 2026; year <= 2028; year += 1) {
  for (let month = 1; month <= 12; month += 1) {
    const key = `${year}-${String(month).padStart(2, "0")}`;
    const fare = 59 + ((month * 7 + year) % 11) * 3;
    MONTH_ENTRIES[key] = { price: `${(fare / 10).toFixed(1)}M`, cheapest: fare <= 65 };
  }
}

const formatDate = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const showDate = (key: string | null) =>
  key ? formatDate.format(new Date(`${key}T00:00:00Z`)) : "Select date";

/**
 * The leading slot on every Back + … navigation set. 24px, except inside a transparent
 * bar's white pill, where every glyph is 20px and the pill's padding does the rest.
 */
function BackButton({ size = 24 }: { size?: 16 | 20 | 24 }) {
  return (
    <button type="button" className="ks-linkbutton" aria-label="Back">
      <LibraryIcon name="back" size={size} color="highEmphasis" />
    </button>
  );
}

type Place = { value?: string; placeholder?: string; subtitle?: string };

/**
 * Figma draws the swap button on every reversible set, and a button that does nothing is
 * hard to judge. The labels and icons belong to the positions, so only the values move —
 * which is what reversing a route means. Each specimen keeps its own pair, so pressing one
 * does not reorder the others.
 */
function ReversibleRoute({
  icons,
  labels,
  places,
}: {
  icons: [GlyphName, GlyphName];
  labels?: [string, string];
  places: [Place, Place];
}) {
  const [reversed, setReversed] = useState(false);
  const [from, to] = reversed ? [places[1], places[0]] : places;

  return (
    <SearchForm
      swap={
        <SearchFormSwapButton
          aria-label="Reverse route"
          onClick={() => setReversed((was) => !was)}
        />
      }
    >
      <SearchFormField icon={<LibraryIcon name={icons[0]} />} label={labels?.[0]} {...from} />
      <SearchFormField icon={<LibraryIcon name={icons[1]} />} label={labels?.[1]} {...to} />
    </SearchForm>
  );
}

/**
 * The three things the library is made of, in dependency order: the token layer, the
 * components built on it, and the icon drop that belongs to neither.
 */
const CATEGORIES = DESIGN_SYSTEM_PAGES;

type Category = (typeof CATEGORIES)[number]["value"];

const CATEGORY_VALUES = CATEGORIES.map(({ value }) => value);

function Ramp({ name, values }: { name: string; values: Record<string, string> }) {
  return (
    <Variant label={name}>
      <div className="ks-swatches">
        {Object.entries(values).map(([step, hex]) => (
          <div className="ks-swatch" key={step}>
            <div className="ks-swatch__chip" style={{ background: hex }} />
            <span>
              {step.toUpperCase()} {hex}
            </span>
          </div>
        ))}
      </div>
    </Variant>
  );
}

/** Lets a specific theme/platform/category combination be linked to, and screenshotted in CI. */
function fromUrl<T extends string>(key: string, fallback: T, allowed: readonly T[]): T {
  const found = new URLSearchParams(window.location.search).get(key) as T | null;
  return found && allowed.includes(found) ? found : fallback;
}

/** The token layer: what every component below is assembled from. */
function StyleView() {
  return (
    <>
      <Section title="Typography" figma="FONT">
        {Object.entries(typography).map(([token, value]) => (
          <div className="ks-row" key={token}>
            <Text variant={token as keyof typeof typography} style={{ minWidth: 320 }}>
              {token}
            </Text>
            <Text variant="body3" color="lowEmphasis">
              {value.fontSize}/{value.lineHeight} · {value.fontWeight}
            </Text>
          </div>
        ))}
      </Section>

      <Section title="Color — primitives" slug="color" figma="COLOR › Primitive Tokens">
        <Ramp name="Neutral" values={neutral} />
        <Ramp name="Blue" values={blue} />
        <Ramp name="Green" values={green} />
        <Ramp name="Red" values={red} />
        <Ramp name="Yellow" values={yellow} />
        <Ramp name="Magenta" values={magenta} />
        <Ramp name="Orange" values={orange} />
        <Ramp name="Purple" values={purple} />
        <Ramp name="Turquoise" values={turquoise} />
      </Section>

      <Section title="Gradients" figma="COLOR › Gradient">
        <div className="ks-swatches">
          {Object.entries(gradients).map(([name, value]) => (
            <div className="ks-swatch" key={name}>
              <div className="ks-swatch__chip" style={{ background: value.css }} />
              <span>{name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Motion" figma="not documented as tokens — the durations and curves the library moves on">
        <div className="ks-stack">
          {Object.entries(motion.duration).map(([name, value]) => (
            <div className="ks-row" key={name}>
              <Text variant="body2Bold" style={{ minWidth: 120 }}>
                {name}
              </Text>
              <Text variant="body3" color="lowEmphasis">
                {value}ms
              </Text>
            </div>
          ))}
          {Object.entries(motion.easing).map(([name, value]) => (
            <div className="ks-row" key={name}>
              <Text variant="body2Bold" style={{ minWidth: 120 }}>
                {name}
              </Text>
              <Text variant="body3" color="lowEmphasis">
                {value}
              </Text>
            </div>
          ))}
        </div>
      </Section>

      {/* The hero is the one composite motion the library specifies, so it gets a
          live specimen rather than a row in the table above. */}
      <MotionView />

      <Section title="Elevation" figma="ELEVATION">
        <div className="ks-row">
          {(["e00", "e01", "e02"] as const).map((level) => (
            <Example key={level} name={level}>
              <div
                style={{
                  width: 160,
                  height: 88,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 8,
                  background: "var(--tds-bg-base-surface)",
                  boxShadow: `var(--tds-elevation-${level})`,
                }}
              >
                <Text variant="body3">{level}</Text>
              </div>
            </Example>
          ))}
        </div>
      </Section>
    </>
  );
}

/** Every component, every variant. The demo state lives here so switching away resets it. */
function ComponentsView() {
  const [checked, setChecked] = useState(true);
  const [picked, setPicked] = useState("one");
  const [segment, setSegment] = useState<"flights" | "hotels" | "trains">("flights");
  const [tab, setTab] = useState<"overview" | "rooms" | "reviews" | "map">("overview");
  const [search, setSearch] = useState("Bali");
  const [filled, setFilled] = useState("Jakarta");
  const [guests, setGuests] = useState(2);
  const [price, setPrice] = useState<[number, number]>([0, 100]);
  const [budget, setBudget] = useState<[number, number]>([20, 60]);
  const [returning, setReturning] = useState(false);
  const [sheet, setSheet] = useState<"none" | "picker" | "lists">("none");
  const [page, setPage] = useState(1);
  const [destination, setDestination] = useState(0);
  const [slid, setSlid] = useState(false);
  const [trip, setTrip] = useState<CalendarRange>({ start: "2026-06-05", end: "2026-06-16" });
  const [flexible, setFlexible] = useState<CalendarRange>({
    start: "2026-09",
    end: "2026-11",
  });
  const [oneWay, setOneWay] = useState("2026-06-12");
  const [nudge, setNudge] = useState(true);
  const [day, setDay] = useState("12");
  const [month, setMonth] = useState("Aug");
  const [year, setYear] = useState("2026");

  return (
    <>
      <Section title="Button" figma="Buttons - 01 Primary … 05 Alert">
        {BUTTON_VARIANTS.map((variant) => (
          <Variant key={variant} label={variant}>
            {BUTTON_SIZES.map((size) => (
              <Example key={size} name={size}>
                <div
                  className="ks-row"
                  style={
                    variant === "invert"
                      ? { background: "var(--tds-bg-high-blue)", padding: 12, borderRadius: 8 }
                      : undefined
                  }
                >
                  <Button variant={variant} size={size}>
                    {variant} button
                  </Button>
                  <Button variant={variant} size={size} loading>
                    loading
                  </Button>
                  <Button variant={variant} size={size} disabled>
                    disabled
                  </Button>
                </div>
              </Example>
            ))}
          </Variant>
        ))}

        {/*
          Figma draws each group twice, sticky and not, and the sticky one carries the home
          indicator — a group pinned to the bottom is the last thing above it.
        */}
        <Variant slug="group" label="Button group">
          <div className="ks-row" style={{ alignItems: "flex-start" }}>
            <Example name="Stacked">
              <div className="ks-phone">
                <ButtonGroup layout="stacked">
                  <Button variant="secondary" fullWidth>
                    Secondary button
                  </Button>
                  <Button fullWidth>Primary button</Button>
                </ButtonGroup>
              </div>
            </Example>
            <Example name="Side by side">
              <div className="ks-phone">
                <ButtonGroup layout="sideBySide">
                  <Button variant="secondary">Sec Button</Button>
                  <Button>Primary button</Button>
                </ButtonGroup>
              </div>
            </Example>
            <Example name="Sticky with home indicator">
              <div className="ks-phone">
                <ButtonGroup layout="stacked" sticky homeIndicator>
                  <Button variant="secondary" fullWidth>
                    Secondary button
                  </Button>
                  <Button fullWidth>Primary button</Button>
                </ButtonGroup>
              </div>
            </Example>
          </div>
        </Variant>

        {/*
          Drag the arrow to the far end, or focus it and press Enter. The four Figma frames
          between Initial and Complete are that one gesture, so they are not examples here.
        */}
        <Variant slug="slide" label="Slide — for the actions that should be hard to do by accident">
          <div className="ks-stack" style={{ maxWidth: 320 }}>
            <Example name="Idle">
              <SlideButton>Slide button</SlideButton>
            </Example>
            <Example name="Loading">
              <SlideButton state="loading">Slide button</SlideButton>
            </Example>
            <Example name="Complete">
              <SlideButton state="complete" completeLabel="Complete Text 🎉">
                Slide button
              </SlideButton>
            </Example>
            <Example name="Disabled">
              <SlideButton disabled>Slide button</SlideButton>
            </Example>
            <Example name="Live">
              <SlideButton
                state={slid ? "complete" : "idle"}
                completeLabel="Complete Text 🎉"
                onComplete={() => setSlid(true)}
              >
                Slide to confirm
              </SlideButton>
            </Example>
          </div>
        </Variant>
      </Section>

      <Section title="Badge" figma="Badges - Indicator | Number | Text">
        <Variant label="Indicator">
          <div className="ks-row">
            <Badge kind="indicator" variant="red" />
            <Badge kind="indicator" variant="green" />
            <Badge kind="indicator" variant="grey" />
          </div>
        </Variant>

        <Variant label="Number">
          <div className="ks-row">
            <Badge kind="number" variant="red" count={1} />
            <Badge kind="number" variant="red" count={10} />
            <Badge kind="number" variant="red" count={120} />
            <Badge kind="number" variant="green" count={7} />
            <Badge kind="number" variant="grey" count={7} />
            <Badge kind="number" variant="red" count={10} gradient />
            <Badge kind="number" variant="green" count={10} gradient />
          </div>
        </Variant>

        <Variant label="Text">
          <div className="ks-row">
            <Badge kind="text" variant="red">
              Badge
            </Badge>
            <Badge kind="text" variant="green">
              Badge
            </Badge>
            <Badge kind="text" variant="grey">
              Badge
            </Badge>
            <Badge kind="text" variant="red" gradient>
              Badge
            </Badge>
          </div>
        </Variant>
      </Section>

      <Section title="Chip" figma="Chips - 01 General | 03 Description">
        <Variant label="General">
          <div className="ks-row">
            <Chip>Inactive</Chip>
            <Chip state="active">Active</Chip>
            <Chip disabled>Disabled</Chip>
            <Chip state="error">Error</Chip>
          </div>
        </Variant>

        <Variant label="Description">
          <div className="ks-row">
            <Chip kind="description" description="2 guests">
              Room
            </Chip>
            <Chip kind="description" state="active" description="2 guests">
              Room
            </Chip>
            <Chip kind="description" disabled description="2 guests">
              Room
            </Chip>
            <Chip kind="description" state="error" description="2 guests">
              Room
            </Chip>
          </div>
        </Variant>
      </Section>

      <Section
        title="Label"
        figma="Labels - 01 Primary | 02 Secondary | 03 Ribbon | 04 Multi"
      >
        <Variant slug="primary" label="Primary — the five documented tones, both sizes">
          <div className="ks-row">
            <Label tone="neutral">Primary label</Label>
            <Label tone="green">Primary label</Label>
            <Label tone="blue">Primary label</Label>
            <Label tone="yellow">Primary label</Label>
            <Label>Primary label</Label>
            <Label size="small">Primary label</Label>
          </div>
        </Variant>

        <Variant slug="secondary" label="Secondary — solid, gradient, and both icon sizes">
          <div className="ks-row">
            <Label kind="secondary" startIcon={<LibraryIcon name="promo" />} countdown="23:59:59.9">
              Secondary label
            </Label>
            <Label
              kind="secondary"
              gradient
              startIcon={<LibraryIcon name="promo" />}
              countdown="23:59:59.9"
            >
              Secondary label
            </Label>
            <Label
              kind="secondary"
              tone="green"
              iconSize={12}
              startIcon={<LibraryIcon name="promo" />}
              countdown="23:59:59.9"
            >
              Secondary label
            </Label>
            <Label
              kind="secondary"
              tone="blue"
              iconSize={12}
              startIcon={<LibraryIcon name="promo" />}
            >
              Secondary label
            </Label>
            {/* Violet ships as a gradient only, so it ignores the solid fill. */}
            <Label kind="secondary" tone="violet" startIcon={<LibraryIcon name="promo" />}>
              Secondary label
            </Label>
          </div>
        </Variant>

        <Variant label="Ribbon">
          <div className="ks-row">
            <Label kind="ribbon">Ribbon</Label>
            <Label kind="ribbon" gradient>
              Ribbon
            </Label>
            <Label kind="ribbon" tone="blue">
              Ribbon
            </Label>
            <Label kind="ribbon" tone="violet">
              Ribbon
            </Label>
          </div>
        </Variant>

        <Variant slug="multi" label="Multi — the trailing chip does not follow the tone">
          <div className="ks-row">
            <Label
              kind="multi"
              startIcon={<LibraryIcon name="promo" />}
              countdown="23:59:59.9"
              extra="100%"
            >
              Multi label
            </Label>
            <Label
              kind="multi"
              tone="green"
              startIcon={<LibraryIcon name="promo" />}
              countdown="23:59:59.9"
              extra="100%"
            >
              Multi label
            </Label>
            <Label
              kind="multi"
              tone="blue"
              gradient
              startIcon={<LibraryIcon name="promo" />}
              extra="100%"
            >
              Multi label
            </Label>
            <Label kind="multi" tone="orange" startIcon={<LibraryIcon name="promo" />} extra="100%">
              Multi label
            </Label>
          </div>
        </Variant>
      </Section>

      <Section title="View" figma="View - Info | View - Section">
        <div className="ks-row" style={{ alignItems: "flex-start" }}>
          <Example name="Info">
            <div className="ks-phone">
              <View
                media={<LibraryIcon name="location" size={32} color="lowEmphasis" />}
                title="Title has no maximum line limit"
                subtext="Subtext has no maximum line limit and no truncation. It supports a combination of regular and bold weights."
                actions={
                  <ButtonGroup layout="stacked">
                    <Button variant="secondary">Secondary button</Button>
                    <Button>Primary button</Button>
                  </ButtonGroup>
                }
              />
            </div>
          </Example>
          <Example name="Section">
            <View
              variant="section"
              media={<LibraryIcon name="location" size={24} color="lowEmphasis" />}
              title="Title has no maximum line limit"
              subtext="Subtext has no maximum line limit and no truncation. It supports a combination of regular and bold weights."
              actions={<Button size="small">Primary button</Button>}
            />
          </Example>
        </div>
      </Section>

      <Section title="Progress step" figma="Progress Step - Horizontal - 01 General">
        {PROGRESS_STATES.map(({ name, step }) => (
          <Example key={name} name={name}>
            <div className="ks-phone">
              <ProgressStep aria-label="Booking" current={step} steps={PROGRESS_STEPS} />
            </div>
          </Example>
        ))}
      </Section>

      <Section title="Pagination" figma="Pagination">
        <div className="ks-stack">
          <Example name="Interactive">
            <Pagination page={page} pageCount={20} onChange={setPage} />
          </Example>
          <Example name="Middle">
            <Pagination page={5} pageCount={20} onChange={() => {}} />
          </Example>
          <Example name="Last page">
            <Pagination page={20} pageCount={20} onChange={() => {}} />
          </Example>
          <Example name="Disabled">
            <Pagination page={1} pageCount={20} onChange={() => {}} disabled />
          </Example>
          <Example name="Few pages">
            <Pagination page={4} pageCount={4} onChange={() => {}} />
          </Example>
        </div>
      </Section>

      {/*
        Device chrome rather than a component a screen uses, but the navigation frames draw
        it and a phone mock-up without it sits 44px too high — so it is here, next to the
        bars that take it as a slot.
      */}
      <Section title="Status bar" figma="[SSoT] NFT — Status Bar (408:17562)">
        <Variant slug="ios" label="iOS — with the island, and without it">
          <div className="ks-stack">
            <Example name="Dynamic island">
              <div className="ks-phone">
                <StatusBar />
              </div>
            </Example>
            <Example name="No dynamic island">
              <div className="ks-phone">
                <StatusBar dynamicIsland={false} />
              </div>
            </Example>
            <Example name="Inverted">
              <div className="ks-phone ks-phone--hero">
                <StatusBar invert dynamicIsland={false} />
              </div>
            </Example>
          </div>
        </Variant>

        <Variant slug="android" label="Android — the navigation shapes, and no clock">
          <div className="ks-stack">
            <Example name="Regular">
              <div className="ks-phone">
                <StatusBar platform="android" />
              </div>
            </Example>
            <Example name="Inverted">
              <div className="ks-phone ks-phone--hero">
                <StatusBar platform="android" invert />
              </div>
            </Example>
          </div>
        </Variant>
      </Section>

      <Section
        title="Navigation"
        figma="Navigation - 01 Top - 01 Regular | 02 Extended, 02 Bottom - Menu, 04 Bottom App Bar"
      >
        <Variant slug="top" label="Top — regular, then scrolling">
          <div className="ks-stack">
            <Example name="Regular">
              <div className="ks-phone">
                <TopBar
                  leading={<BackButton />}
                  title="Title is limited to 1 line"
                  actions={
                    <>
                      <LibraryIcon name="search" size={24} color="highEmphasis" />
                      <LibraryIcon name="passenger" size={24} color="highEmphasis" />
                    </>
                  }
                />
              </div>
            </Example>
            <Example name="Scrolling">
              <div className="ks-phone">
                <TopBar
                  scrolling
                  leading={<BackButton />}
                  media={<LibraryIcon name="seatPlan" size={24} color="lowEmphasis" />}
                  title="Title is limited to 1 line"
                  subtitle="Subtitle is limited to 1 line"
                  actions={<Button size="small">Button</Button>}
                />
              </div>
            </Example>
          </div>
        </Variant>

        {/*
          The two Transparant sets. Both are drawn over art because that is the whole of
          what they are for, and both are shown twice: white pills over the photograph, then
          plain icons once the bar has scrolled onto a surface.
        */}
        <Variant
          slug="top-transparent"
          label="Top transparent — over a hero, until the scroll gives it a surface"
        >
          <div className="ks-stack">
            <Example name="Icons">
              <div className="ks-phone ks-phone--hero">
                <TopBar
                  transparent
                  statusBar={<StatusBar invert dynamicIsland={false} />}
                  leading={<BackButton size={20} />}
                  actions={
                    <>
                      <LibraryIcon name="search" size={20} color="highEmphasis" />
                      <LibraryIcon name="promo" size={20} color="highEmphasis" />
                      <LibraryIcon name="passenger" size={20} color="highEmphasis" />
                    </>
                  }
                />
              </div>
            </Example>
            <Example name="Icons scrolling">
              <div className="ks-phone ks-phone--hero">
                <TopBar
                  transparent
                  scrolling
                  statusBar={<StatusBar dynamicIsland={false} />}
                  leading={<BackButton />}
                  actions={
                    <>
                      <LibraryIcon name="search" size={24} color="highEmphasis" />
                      <LibraryIcon name="promo" size={24} color="highEmphasis" />
                      <LibraryIcon name="passenger" size={24} color="highEmphasis" />
                    </>
                  }
                />
              </div>
            </Example>
            <Example name="Searchbox">
              <div className="ks-phone ks-phone--hero">
                <TopBar
                  transparent
                  statusBar={<StatusBar invert dynamicIsland={false} />}
                  leading={<BackButton size={20} />}
                  search={
                    <SearchBox
                      size="small"
                      placeholder="Search Box"
                      icon={<SearchIcon />}
                      readOnly
                    />
                  }
                  actions={
                    <>
                      <LibraryIcon name="promo" size={20} color="highEmphasis" />
                      <LibraryIcon name="passenger" size={20} color="highEmphasis" />
                    </>
                  }
                />
              </div>
            </Example>
            <Example name="Searchbox scrolling">
              <div className="ks-phone ks-phone--hero">
                <TopBar
                  transparent
                  scrolling
                  statusBar={<StatusBar dynamicIsland={false} />}
                  leading={<BackButton />}
                  search={
                    <SearchBox
                      size="small"
                      placeholder="Search Box"
                      icon={<SearchIcon />}
                      readOnly
                    />
                  }
                  actions={
                    <>
                      <LibraryIcon name="promo" size={24} color="highEmphasis" />
                      <LibraryIcon name="passenger" size={24} color="highEmphasis" />
                    </>
                  }
                />
              </div>
            </Example>
          </div>
        </Variant>

        <Variant
          slug="top-extended"
          label="Top extended — the title drops to its own row, and slides back up on scroll"
        >
          <div className="ks-stack">
            <Example name="Regular">
              <div className="ks-phone">
                <TopBar
                  variant="extended"
                  leading={<BackButton />}
                  title="Title is limited to 1 line"
                  actions={
                    <Text as="span" variant="body2Bold" color="active">
                      Text Link
                    </Text>
                  }
                />
              </div>
            </Example>
            <Example name="Scrolling">
              <div className="ks-phone">
                <TopBar
                  variant="extended"
                  scrolling
                  leading={<BackButton />}
                  title="Title is limited to 1 line"
                  actions={
                    <Text as="span" variant="body2Bold" color="active">
                      Text Link
                    </Text>
                  }
                />
              </div>
            </Example>
          </div>
        </Variant>

        <Variant slug="bottom" label="Bottom — the tab bar and the app bar">
          <div className="ks-stack">
            <Example name="Tab bar">
              <div className="ks-phone">
                <BottomNav
                  current={destination}
                  homeIndicator
                  items={BOTTOM_NAV.map((item, index) => ({
                    icon: <LibraryIcon name={item.icon} size={24} />,
                    label: item.label,
                    onSelect: () => setDestination(index),
                  }))}
                />
              </div>
            </Example>
            <Example name="App bar">
              <div className="ks-phone">
                <BottomAppBar
                  scrolling
                  homeIndicator
                  top={<Snackbar>Prices went up 12% since you last looked.</Snackbar>}
                >
                  <div className="ks-app-bar">
                    <Text variant="small" color="lowEmphasis">
                      Total price
                    </Text>
                    <Text variant="body2Bold">IDR 1,250,000</Text>
                  </div>
                  <Button>Continue</Button>
                </BottomAppBar>
              </div>
            </Example>
          </div>
        </Variant>
      </Section>

      <Section
        title="Calendar"
        figma=".Calendar - Date | .Calendar - Month | .Calendar - BottomBar"
      >
        <Variant
          slug="range"
          label="Dates, a range, a fare on every day — Figma's Range Multi Month, driven by the value"
        >
          <div className="ks-phone ks-phone--tall">
            <TopBar
              leading={<BackButton />}
              title="Set Your Travel Period"
              actions={
                <button
                  type="button"
                  className="ks-linkbutton"
                  onClick={() => setTrip({ start: null, end: null })}
                >
                  <Text as="span" variant="body2Bold" color="active">
                    Reset
                  </Text>
                </button>
              }
            />
            <Calendar
              aria-label="Travel period"
              selectionMode="range"
              priceDisplay="specific"
              value={trip}
              onValueChange={(next) => setTrip(next as CalendarRange)}
              entries={DATE_ENTRIES}
              today={CALENDAR_TODAY}
              min={CALENDAR_TODAY}
              from="2026-06"
              to="2026-08"
            />
            <CalendarBottomBar
              legend={<CalendarLegend />}
              homeIndicator
              action={<Button>Save</Button>}
            >
              <CalendarSummary>
                <CalendarSummaryItem label="Departure" value={showDate(trip.start)} />
                <CalendarSummaryItem
                  align="end"
                  label={nudge ? "Want great deals?" : "Return"}
                  onDismiss={nudge ? () => setNudge(false) : undefined}
                  value={
                    trip.end ? (
                      showDate(trip.end)
                    ) : (
                      <Text as="span" variant="body2Bold" color="active">
                        Book Roundtrip
                      </Text>
                    )
                  }
                />
              </CalendarSummary>
            </CalendarBottomBar>
          </div>
        </Variant>

        <Variant
          slug="months"
          label="Months, for a flexible date — a range here is solid, not washed"
        >
          <div className="ks-phone ks-phone--tall">
            <Calendar
              aria-label="Travel months"
              precision="month"
              selectionMode="range"
              priceDisplay="specific"
              value={flexible}
              onValueChange={(next) => setFlexible(next as CalendarRange)}
              entries={MONTH_ENTRIES}
              today="2026-06"
              min="2026-06"
              from="2026"
              to="2028"
            />
          </div>
        </Variant>

        <Variant
          slug="single"
          label="One date and no prices, then the dot that stands in for a price"
        >
          <div className="ks-row" style={{ alignItems: "flex-start" }}>
            <Example name="Date">
              <div className="ks-phone ks-phone--tall">
                <Calendar
                  aria-label="Departure date"
                  value={oneWay}
                  onValueChange={(next) => setOneWay(next as string)}
                  entries={DATE_ENTRIES}
                  today={CALENDAR_TODAY}
                  min={CALENDAR_TODAY}
                  from="2026-06"
                  to="2026-07"
                />
              </div>
            </Example>
            <Example name="Month">
              <div className="ks-phone ks-phone--tall">
                <Calendar
                  aria-label="Travel month"
                  precision="month"
                  priceDisplay="general"
                  value={flexible.start}
                  onValueChange={(next) => setFlexible({ start: next as string, end: null })}
                  entries={MONTH_ENTRIES}
                  today="2026-06"
                  min="2026-06"
                  from="2026"
                  to="2027"
                />
              </div>
            </Example>
          </div>
        </Variant>
      </Section>

      <Section title="Toggle & Radio" figma="Control - 01 Selection - 02 Radio | 03 Toggle">
        <Variant slug="toggle-large" label="Toggle — large">
          <div className="ks-row">
            <Toggle
              aria-label="Large toggle"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
            />
            <Toggle aria-label="Large off" defaultChecked={false} />
            <Toggle aria-label="Large disabled off" disabled />
            <Toggle aria-label="Large disabled on" disabled defaultChecked />
          </div>
        </Variant>

        <Variant slug="toggle-small" label="Toggle — small">
          <div className="ks-row">
            <Toggle size="small" aria-label="Small on" defaultChecked />
            <Toggle size="small" aria-label="Small off" />
            <Toggle size="small" aria-label="Small disabled off" disabled />
            <Toggle size="small" aria-label="Small disabled on" disabled defaultChecked />
          </div>
        </Variant>

        <Variant label="Radio">
          <div className="ks-row">
            <Radio
              name="ks-radio"
              id="ks-radio-1"
              checked={picked === "one"}
              onChange={() => setPicked("one")}
            >
              Selected
            </Radio>
            <Radio
              name="ks-radio"
              id="ks-radio-2"
              checked={picked === "two"}
              onChange={() => setPicked("two")}
            >
              Unselected
            </Radio>
            <Radio name="ks-radio-d" id="ks-radio-3" disabled>
              Disabled
            </Radio>
            <Radio name="ks-radio-d" id="ks-radio-4" disabled defaultChecked>
              Disabled selected
            </Radio>
            <Radio name="ks-radio-e" id="ks-radio-5" error>
              Error
            </Radio>
          </div>
        </Variant>
      </Section>

      <Section title="Segmented control" figma="Control - 02 Segmented - 01 Squircle | 02 Pill">
        <div className="ks-col" style={{ maxWidth: 360 }}>
          <Example name="Squircle">
            <SegmentedControl
              aria-label="Product (squircle, medium)"
              options={[
                { value: "flights", label: "Flights" },
                { value: "hotels", label: "Hotels" },
                { value: "trains", label: "Trains" },
              ]}
              value={segment}
              onChange={setSegment}
            />
          </Example>
          <Example name="Pill">
            <SegmentedControl
              aria-label="Product (pill, small)"
              shape="pill"
              size="small"
              options={[
                { value: "flights", label: "Flights" },
                { value: "hotels", label: "Hotels" },
                { value: "trains", label: "Trains" },
              ]}
              value={segment}
              onChange={setSegment}
            />
          </Example>
        </div>
      </Section>

      <Section
        title="Quantity editor"
        figma="Control - 01 Selection - 04 Quantity Editor - 01 Multi Button | 02 Single Button"
      >
        <Variant label="Multi button">
          <div className="ks-row">
            <QuantityEditor value={guests} onChange={setGuests} aria-label="Guests" min={1} max={4} />
            <Text variant="body3" color="lowEmphasis">
              min 1, max 4 — the spent button flattens at each end
            </Text>
          </div>
        </Variant>

        <Variant slug="single-button" label="Single button, on its own">
          <div className="ks-row">
            <QuantityStepButton direction="minus" aria-label="Decrease" />
            <QuantityStepButton direction="plus" aria-label="Increase" />
            <QuantityStepButton direction="minus" aria-label="Decrease" disabled />
            <QuantityStepButton direction="plus" aria-label="Increase" disabled />
          </div>
        </Variant>
      </Section>

      <Section title="Slider" figma="Control - 01 Selection - 05 Slider">
        <div className="ks-col" style={{ maxWidth: 320 }}>
          <Variant slug="initial" label="Initial — both thumbs at the ends">
            <Slider
              value={price}
              onChange={setPrice}
              startLabel="Lowest price"
              endLabel="Highest price"
            />
          </Variant>
          <Variant slug="half" label="Half — drag, or tab to a thumb for the focussed state">
            <Slider
              value={budget}
              onChange={setBudget}
              startLabel="Minimum budget"
              endLabel="Maximum budget"
            />
          </Variant>
        </div>
      </Section>

      <Section title="Forms" figma="Forms - 01 Textfield | 02 Dropdown, Search Box - Grey">
        <div className="ks-col">
          <Example name="Text field">
            <TextField label="Destination" helperText="Helper text has no maximum line limit." />
          </Example>
          <Example name="Text field filled">
            <TextField
              label="Destination"
              value={filled}
              onChange={(e) => setFilled(e.target.value)}
              helperText="Helper text has no maximum line limit."
            />
          </Example>
          <Example name="Text field disabled">
            <TextField label="Destination" disabled helperText="Disabled" />
          </Example>
          <Example name="Text field error">
            <TextField label="Destination" error helperText="Error text cannot be hidden." />
          </Example>
          <Example name="Dropdown">
            <Dropdown label="Cabin class" placeholder="Choose one" helperText="Pick a cabin">
              <option value="economy">Economy</option>
              <option value="business">Business</option>
            </Dropdown>
          </Example>
          <Example name="Dropdown error">
            <Dropdown label="Cabin class" error placeholder="Choose one" helperText="Required">
              <option value="economy">Economy</option>
            </Dropdown>
          </Example>
          <Example name="Search box medium">
            <SearchBox
              size="medium"
              placeholder="Search Box"
              icon={<SearchIcon />}
              clearIcon={<CloseIcon />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch("")}
            />
          </Example>
          <Example name="Search box small">
            <SearchBox size="small" placeholder="Search Box" icon={<SearchIcon />} />
          </Example>
        </div>
      </Section>

      <Section title="Search form" figma="Forms - 05 Search Form - 01 Group … 04 Single">
        <div className="ks-row" style={{ alignItems: "flex-start" }}>
          <div className="ks-col" style={{ width: 320 }}>
            <Variant slug="reversible" label="02 Reversible — 01 General, initial then filled">
              <Example name="Initial">
                <ReversibleRoute
                  icons={["flightDepart", "flightArrived"]}
                  labels={["From", "To"]}
                  places={[{ placeholder: "Where from?" }, { placeholder: "Where to?" }]}
                />
              </Example>
              <Example name="Filled">
                <ReversibleRoute
                  icons={["flightDepart", "flightArrived"]}
                  labels={["From", "To"]}
                  places={[{ value: "Jakarta" }, { value: "Denpasar" }]}
                />
              </Example>
            </Variant>

            <Variant slug="reversible-subtitle" label="02 Reversible — 02 With Subtitle">
              <ReversibleRoute
                icons={["location", "location"]}
                places={[
                  { value: "Jakarta", subtitle: "CGK" },
                  { value: "Denpasar", subtitle: "DPS" },
                ]}
              />
            </Variant>
          </div>

          <div className="ks-col" style={{ width: 320 }}>
            <Variant
              slug="with-toggle"
              label="03 With Toggle — the second field appears when it is on"
            >
              <SearchForm>
                <SearchFormField
                  icon={<LibraryIcon name="calendar" />}
                  value="Thu, 6 Aug"
                  trailing={
                    <>
                      <Text variant="small" color="lowEmphasis">
                        Return
                      </Text>
                      <Toggle
                        size="small"
                        aria-label="Add a return flight"
                        checked={returning}
                        onChange={(event) => setReturning(event.target.checked)}
                      />
                    </>
                  }
                />
                {returning ? (
                  <SearchFormField icon={<LibraryIcon name="calendar" />} value="Sun, 9 Aug" />
                ) : null}
              </SearchForm>
            </Variant>

            <Variant slug="single" label="04 Single — counters behind a vertical divider">
              <Example name="Enabled">
                <SearchForm>
                  <SearchFormField
                    value="1 adult"
                    trailing={
                      <>
                        <Divider orientation="vertical" />
                        <SearchFormPiece icon={<LibraryIcon name="passenger" />} count="99" />
                        <SearchFormPiece icon={<LibraryIcon name="seatPlan" />} count="99" />
                      </>
                    }
                  />
                </SearchForm>
              </Example>
              <Example name="Disabled">
                <SearchForm>
                  <SearchFormField
                    value="1 adult"
                    disabled
                    trailing={
                      <>
                        <Divider orientation="vertical" />
                        <SearchFormPiece icon={<LibraryIcon name="passenger" />} count="99" />
                        <SearchFormPiece icon={<LibraryIcon name="seatPlan" />} count="99" />
                      </>
                    }
                  />
                </SearchForm>
              </Example>
            </Variant>

            <Variant slug="group" label="01 Group — the sets stacked, which is all that set is">
              <div className="ks-col">
                <ReversibleRoute
                  icons={["flightDepart", "flightArrived"]}
                  labels={["From", "To"]}
                  places={[{ value: "Jakarta" }, { value: "Denpasar" }]}
                />
                <SearchForm>
                  <SearchFormField icon={<LibraryIcon name="calendar" />} value="Thu, 6 Aug" />
                </SearchForm>
                <Button>Search flights</Button>
              </div>
            </Variant>
          </div>
        </div>
      </Section>

      <Section title="Accordion" figma="Accordion">
        <div className="ks-col" style={{ maxWidth: 480 }}>
          <Example name="Basic">
            <Accordion title="Title has no max line limit" type="basic" defaultExpanded>
              Slot area — put local content here.
            </Accordion>
          </Example>
          <Example name="Flat">
            <Accordion title="Title has no max line limit" type="flat">
              Slot area — put local content here.
            </Accordion>
          </Example>
          <Example name="Outline">
            <Accordion title="Title has no max line limit" type="outline">
              Slot area — put local content here.
            </Accordion>
          </Example>
        </div>
      </Section>

      <Section title="Tabs" figma="Tabs - 01 General">
        <Tabs
          aria-label="Hotel detail"
          value={tab}
          onChange={setTab}
          items={[
            { value: "overview", label: "Overview" },
            { value: "rooms", label: "Rooms", badge: <Badge kind="number" count={3} /> },
            { value: "reviews", label: "Reviews" },
            { value: "map", label: "Map", disabled: true },
          ]}
        />
      </Section>

      <Section
        title="Bottom sheet"
        figma="bottom sheet — Picker | Searchable Lists, header from Navigation - 03 Bottom Sheet"
      >
        <div className="ks-row">
          <Example name="Picker">
            <Button variant="secondary" onClick={() => setSheet("picker")}>
              Open the picker
            </Button>
          </Example>
          <Example name="Searchable list">
            <Button variant="secondary" onClick={() => setSheet("lists")}>
              Open the searchable list
            </Button>
          </Example>
        </div>
        <Text variant="body3" color="lowEmphasis">
          Escape or a click on the scrim closes either one; focus is trapped in the sheet and
          returns to the button afterwards.
        </Text>

        <BottomSheet
          open={sheet === "picker"}
          onClose={() => setSheet("none")}
          title="Title has no maximum line limit"
          subtext="Subtext is limited to 2 lines. It supports a combination of regular and bold weights."
          homeIndicator
          footer={<Button>Primary button</Button>}
        >
          <div style={{ padding: `0 var(--tds-space-20)` }}>
            <WheelPicker
              columns={[
                {
                  label: "Day",
                  options: Array.from({ length: 31 }, (_, index) => ({ value: String(index + 1) })),
                  value: day,
                  onChange: setDay,
                },
                {
                  label: "Month",
                  options: MONTHS.map((value) => ({ value })),
                  value: month,
                  onChange: setMonth,
                },
                {
                  label: "Year",
                  options: ["2026", "2027", "2028"].map((value) => ({ value })),
                  value: year,
                  onChange: setYear,
                },
              ]}
            />
          </div>
        </BottomSheet>

        <BottomSheet
          open={sheet === "lists"}
          onClose={() => setSheet("none")}
          title="Title has no maximum line limit"
          link={
            <button type="button" onClick={() => setSheet("none")}>
              Text Link
            </button>
          }
          homeIndicator
        >
          <div style={{ padding: `var(--tds-space-8) var(--tds-space-20)` }}>
            <SearchBox size="medium" placeholder="Search Box" icon={<SearchIcon />} />
          </div>
          {["Jakarta", "Denpasar", "Surabaya", "Medan", "Yogyakarta"].map((city) => (
            <div className="ks-sheet-row" key={city}>
              <LibraryIcon name="location" color="lowEmphasis" />
              <Text>{city}</Text>
            </div>
          ))}
        </BottomSheet>
      </Section>

      <Section title="Snackbar & Tooltip" figma="Snackbar - Black, Tooltips">
        <Variant label="Snackbar">
          <div style={{ width: 320 }}>
            <Snackbar action={<a href="#components/snackbar-tooltip">Text Link</a>}>
              Subtext has no maximum line limit and no truncation.
            </Snackbar>
          </div>
        </Variant>

        <Variant label="Tooltip">
          <div className="ks-row" style={{ alignItems: "flex-start" }}>
            <Example name="Tail up">
              <Tooltip tail="up">Tooltips explain what an icon cannot.</Tooltip>
            </Example>
            <Example name="Tail down">
              <Tooltip tail="down">Tail down</Tooltip>
            </Example>
            <Example name="Tail left">
              <Tooltip tail="left">Tail left</Tooltip>
            </Example>
            <Example name="Tail right">
              <Tooltip tail="right">Tail right</Tooltip>
            </Example>
          </div>
        </Variant>
      </Section>
    </>
  );
}

/**
 * Unfiltered, the drop is over a thousand tiles. The cap is about how much DOM one
 * scroll has to carry — the images themselves are lazy, so bytes were never the problem.
 */
const ICON_LIMIT = 240;

function IconsView() {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const found = useMemo(() => ICONS.filter((icon) => matchesQuery(icon, query)), [query]);
  const visible = showAll ? found : found.slice(0, ICON_LIMIT);
  const total = ICONS.length.toLocaleString();

  return (
    <Section title="Icons" figma="not the .fig export — the SVG drop in tds library/tds icon">
      <div className="ks-col" style={{ marginBottom: 16 }}>
        <SearchBox
          size="medium"
          placeholder={`Search ${total} icons`}
          icon={<SearchIcon />}
          clearIcon={<CloseIcon />}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery("")}
        />
      </div>

      <p className="ks-caption">
        {found.length === ICONS.length
          ? `${total} icons`
          : `${found.length.toLocaleString()} of ${total} icons`}
      </p>

      {found.length === 0 ? (
        <Text variant="body3" color="lowEmphasis">
          No icon name contains “{query.trim()}”.
        </Text>
      ) : (
        <ul className="ks-icons">
          {visible.map((icon) => (
            <li className="ks-icon" key={icon.name}>
              <span className="ks-icon__tile">
                <img src={icon.url} alt="" width={24} height={24} loading="lazy" decoding="async" />
              </span>
              <span className="ks-icon__name">{icon.name}</span>
            </li>
          ))}
        </ul>
      )}

      {visible.length < found.length ? (
        <div className="ks-row" style={{ marginTop: 16, marginBottom: 0 }}>
          <Button variant="tertiary" size="small" onClick={() => setShowAll(true)}>
            Show all {found.length.toLocaleString()}
          </Button>
        </div>
      ) : null}
    </Section>
  );
}

export function App() {
  const [theme, setTheme] = useState<ThemeName>(() =>
    fromUrl("theme", "light", ["light", "dark"] as const),
  );
  const [platform] = useState<PlatformName>(() =>
    fromUrl("platform", "mobile", ["mobile", "desktop", "dashboard"] as const),
  );
  const [category, setCategory] = useState<Category>(() =>
    fromUrl("category", "style", CATEGORY_VALUES),
  );

  // The side menu links to each category as `#<category>`; this follows the hash.
  useAnchorTarget(category, setCategory, CATEGORY_VALUES);

  useEffect(() => {
    document.documentElement.setAttribute("data-tds-theme", theme);
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = event.data;
      if (!data || data.type !== "joy-theme") return;
      if (data.theme === "light" || data.theme === "dark") {
        setTheme(data.theme);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <TiketProvider theme={theme} platform={platform} className="ks-root">
      <div className="ks-page">
        <Contents category={category} />

        <AnchorRoot path={category}>
          {category === "style" ? <StyleView /> : null}
          {category === "components" ? <ComponentsView /> : null}
          {category === "icons" ? <IconsView /> : null}
        </AnchorRoot>
      </div>
    </TiketProvider>
  );
}

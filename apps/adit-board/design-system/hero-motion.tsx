import { useEffect, useRef, useState } from "react";
import { Button, SearchForm, SearchFormField, Text, Toggle } from "@tiket-ds/ui";
import { heroMotion, motion } from "@tiket-ds/tokens";

import { Example, Section, Variant } from "./anchors.js";
import { LibraryIcon } from "./icons.js";

/**
 * The mobile hero's two moves, as specimens you can run.
 *
 * Motion cannot be reviewed from a still, and these two are easy to get wrong by
 * a factor of three, so both specimens are live and both expose their numbers:
 * the defaults are `heroMotion` from the token package, and the fields let you
 * try a value before writing it into a product.
 */
export function MotionView() {
  return (
    <Section
      title="Hero"
      slug="hero"
      figma="[SSoT] NFT — Trains 417:20145 › prototype Interaction (After delay · Smart animate)"
    >
      <p>
        A landing page's hero is a photograph with the search form over it. It
        moves twice: it settles in when its art appears or changes, and it
        stretches when you pull the page down past the top. Nothing else on the
        screen animates on arrival — the hero is the only thing granted a move
        this long.
      </p>

      <Variant slug="settle" label="Settle — on arrival, and on every change of art">
        <Settle />
      </Variant>

      <Variant slug="stretch" label="Stretch — the pull carries the whole screen, not just the photograph">
        <Stretch />
      </Variant>
    </Section>
  );
}

const TABS = ["KAI", "Whoosh", "Shinkansen"] as const;

type Tab = (typeof TABS)[number];

const nextTab = (tab: Tab): Tab => TABS[(TABS.indexOf(tab) + 1) % TABS.length]!;

/** Distinct art per tab, so the replay has something to be about. */
const ART = {
  KAI: "linear-gradient(160deg, #0064d2, #00c1eb)",
  Whoosh: "linear-gradient(160deg, #7600d2, #fa00b4)",
  Shinkansen: "linear-gradient(160deg, #003d81, #30b6c5)",
} as const;

function Settle() {
  const [tab, setTab] = useState<Tab>("KAI");
  const [delay, setDelay] = useState<number>(heroMotion.settle.delay);
  const [duration, setDuration] = useState<number>(heroMotion.settle.duration);
  const [scale, setScale] = useState<number>(heroMotion.settle.scaleFrom);
  const [easing, setEasing] = useState<keyof typeof motion.easing>("symmetric");
  const art = useRef<HTMLDivElement>(null);

  const timing = motion.easing[easing];

  useEffect(() => {
    const node = art.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Land on the start scale with the transition off and flush it, or both
    // writes coalesce and the move only ever plays on the first mount.
    node.style.transition = "none";
    node.style.transform = `scale(${scale})`;
    void node.offsetHeight;

    const timer = window.setTimeout(() => {
      node.style.transition = `transform ${duration}ms ${timing}`;
      node.style.transform = `scale(${heroMotion.settle.scaleTo})`;
    }, delay);

    return () => window.clearTimeout(timer);
  }, [tab, delay, duration, scale, timing]);

  return (
    <div className="ks-row" style={{ alignItems: "flex-start" }}>
      <Example name="Specimen">
        <div className="ks-hero">
          <div className="ks-hero__art" ref={art} style={{ background: ART[tab] }} />
          <div className="ks-hero__body">
            <Text variant="heading2" color="invert">
              Trains
            </Text>
            <div className="ks-hero__tabs" role="tablist">
              {TABS.map((name) => (
                <button
                  key={name}
                  type="button"
                  role="tab"
                  aria-selected={name === tab}
                  onClick={() => setTab(name)}
                >
                  <Text as="span" variant="body2Bold">
                    {name}
                  </Text>
                </button>
              ))}
            </div>
            <SearchForm>
              <SearchFormField
                icon={<LibraryIcon name="location" />}
                value="Gambir"
              />
            </SearchForm>
          </div>
        </div>
      </Example>

      <div className="ks-col" style={{ width: 280 }}>
        <Field label="After delay" value={`${delay}ms`}>
          <input
            type="range"
            min={0}
            max={600}
            step={50}
            value={delay}
            onChange={(event) => setDelay(Number(event.target.value))}
          />
        </Field>
        <Field label="Duration" value={`${duration}ms`}>
          <input
            type="range"
            min={200}
            max={2000}
            step={50}
            value={duration}
            onChange={(event) => setDuration(Number(event.target.value))}
          />
        </Field>
        <Field label="Scale from" value={`${scale}×`}>
          <input
            type="range"
            min={1}
            max={2}
            step={0.05}
            value={scale}
            onChange={(event) => setScale(Number(event.target.value))}
          />
        </Field>
        <Field label="Easing" value={timing}>
          <select
            value={easing}
            onChange={(event) =>
              setEasing(event.target.value as keyof typeof motion.easing)
            }
          >
            {Object.keys(motion.easing).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </Field>

        <div className="ks-row">
          <Button size="small" onClick={() => setTab(nextTab(tab))}>
            Change art
          </Button>
          <Button
            size="small"
            variant="secondary"
            onClick={() => {
              setDelay(heroMotion.settle.delay);
              setDuration(heroMotion.settle.duration);
              setScale(heroMotion.settle.scaleFrom);
              setEasing("symmetric");
            }}
          >
            Reset
          </Button>
        </div>

        <Text variant="body3" color="lowEmphasis">
          The move belongs to the art, not to the form: the tabs and the fields
          hold still while the photograph settles behind them. Only wire it up
          where each tab brings its own art — replaying it on a photograph that
          did not change reads as a glitch.
        </Text>
      </div>
    </div>
  );
}

function Stretch() {
  const [pull, setPull] = useState(48);
  const [carry, setCarry] = useState(true);
  const [springing, setSpringing] = useState(false);
  const [duration, setDuration] = useState<number>(heroMotion.stretch.duration);
  const [zoom, setZoom] = useState<number>(heroMotion.stretch.scaleAtMaxPull);
  const [easing, setEasing] =
    useState<keyof typeof motion.easing>("decelerate");

  const { stretch } = heroMotion;
  const grown = 1 + (pull / stretch.maxPull) * (zoom - 1);
  const timing = motion.easing[easing];

  const release = () => {
    setSpringing(true);
    setPull(0);
    window.setTimeout(() => setSpringing(false), duration);
  };

  return (
    <div className="ks-row" style={{ alignItems: "flex-start" }}>
      <Example name="Specimen">
        <div
          className="ks-hero"
          data-springing={springing || undefined}
          style={{
            "--tds-hero-stretch-duration": `${duration}ms`,
            "--tds-hero-stretch-easing": timing,
          } as React.CSSProperties}
        >
          <div
            className="ks-hero__art"
            style={{
              background: ART.KAI,
              transform: `scale(${grown})`,
              transformOrigin: "center top",
            }}
          />
          <div
            className="ks-hero__body"
            style={{ transform: carry ? `translateY(${pull}px)` : undefined }}
          >
            <Text variant="heading2" color="invert">
              Trains
            </Text>
            <SearchForm>
              <SearchFormField
                icon={<LibraryIcon name="location" />}
                value="Gambir"
              />
            </SearchForm>
          </div>
        </div>
      </Example>

      <div className="ks-col" style={{ width: 280 }}>
        <Field label="Pull" value={`${Math.round(pull)}px of ${stretch.maxPull}px`}>
          <input
            type="range"
            min={0}
            max={stretch.maxPull}
            value={pull}
            onChange={(event) => setPull(Number(event.target.value))}
          />
        </Field>
        <Field label="Zoom at full pull" value={`${zoom.toFixed(2)}×`}>
          <input
            type="range"
            min={1}
            max={1.5}
            step={0.01}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          />
        </Field>
        <Field label="Release — duration" value={`${duration}ms`}>
          <input
            type="range"
            min={0}
            max={1000}
            step={20}
            value={duration}
            onChange={(event) => setDuration(Number(event.target.value))}
          />
        </Field>
        <Field label="Release — easing" value={timing}>
          <select
            value={easing}
            onChange={(event) =>
              setEasing(event.target.value as keyof typeof motion.easing)
            }
          >
            {Object.keys(motion.easing).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </Field>
        <div className="ks-row">
          <Toggle
            size="small"
            aria-label="Carry the screen with the pull"
            checked={carry}
            onChange={(event) => setCarry(event.target.checked)}
          />
          <Text variant="body3">Carry the screen with it</Text>
        </div>
        <div className="ks-row">
          <Button size="small" onClick={release}>
            Release
          </Button>
          <Button
            size="small"
            variant="secondary"
            onClick={() => {
              setDuration(stretch.duration);
              setZoom(stretch.scaleAtMaxPull);
              setEasing("decelerate");
              setPull(48);
            }}
          >
            Reset
          </Button>
        </div>

        <Text variant="body3" color="lowEmphasis">
          Scaled from its top edge, so the top stays pinned and the bottom
          travels: the photograph grows into the space instead of a gap opening
          above it. Everything over the art moves the same distance the bottom
          edge does — with that off, the hero grows behind furniture that has not
          noticed. The gesture itself has no transition, so it tracks the finger;
          the pull takes {stretch.resistance * 100}% of finger travel, tapering
          to nothing at the cap.
        </Text>
        <Text variant="body3" color="lowEmphasis">
          How much the art zooms over that pull is the second thing to set.{" "}
          {stretch.scaleAtMaxPull}× is the point where it grows by the distance
          the page travels — the picture keeps up with the finger. Take it higher
          and the photograph gains on the gesture; take it towards 1× and the page
          slides over a picture that has barely moved.
        </Text>
        <Text variant="body3" color="lowEmphasis">
          The release is what gives the gesture its character. Switch the easing
          to out and the springiness comes back: over 96px a curve that spends
          its travel in the first third leaves the finger faster than the hand
          did, then crawls the last few pixels. Decelerate over{" "}
          {stretch.duration}ms covers the same distance evenly.
        </Text>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <label className="ks-field">
      <span className="ks-field__label">
        <Text as="span" variant="body3" color="lowEmphasis">
          {label}
        </Text>
        <Text as="span" variant="body3">
          {value}
        </Text>
      </span>
      {children}
    </label>
  );
}

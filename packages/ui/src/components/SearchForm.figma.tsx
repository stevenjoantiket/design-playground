import figma from "@figma/code-connect";

import { Button } from "./Button.js";
import { Divider } from "./Divider.js";
import {
  SearchForm,
  SearchFormField,
  SearchFormPiece,
  SearchFormSwapButton,
} from "./SearchForm.js";
import { Toggle } from "./Toggle.js";

/*
 * One mapping per Figma set, all onto the same two components. `State = Initial | Filled`
 * never becomes a prop: a field is Filled when it has a `value`, so the snippet a designer
 * copies can't contradict the data it is given.
 *
 * The icon slots come through as instances, which keeps `tds_ic_placeholder` out of the
 * generated code — whatever the designer swapped in is what the snippet shows.
 */

figma.connect(SearchForm, "<TDS>?node-id=1-3084", {
  props: {
    fromIcon: figma.instance("Select Icon 1"),
    toIcon: figma.instance("Select Icon 2"),
    fromLabel: figma.string("Input Title Text 1"),
    toLabel: figma.string("Input Title Text 2"),
  },
  example: ({ fromIcon, toIcon, fromLabel, toLabel }) => (
    <SearchForm swap={<SearchFormSwapButton aria-label="Reverse route" />}>
      <SearchFormField icon={fromIcon} label={fromLabel} value="Jakarta" />
      <SearchFormField icon={toIcon} label={toLabel} value="Denpasar" />
    </SearchForm>
  ),
});

figma.connect(SearchForm, "<TDS>?node-id=1-3119", {
  props: {
    fromIcon: figma.instance("Select Icon 1"),
    toIcon: figma.instance("Select Icon 2"),
    fromSubtitle: figma.string("Input Subtitle 1"),
    toSubtitle: figma.string("Input Subtitle 2"),
  },
  example: ({ fromIcon, toIcon, fromSubtitle, toSubtitle }) => (
    <SearchForm swap={<SearchFormSwapButton aria-label="Reverse route" />}>
      <SearchFormField icon={fromIcon} value="Jakarta" subtitle={fromSubtitle} />
      <SearchFormField icon={toIcon} value="Denpasar" subtitle={toSubtitle} />
    </SearchForm>
  ),
});

/*
 * Activated draws a second field. That is the point of the set, so it maps to whether the
 * second field is rendered rather than to a `state` prop.
 */
figma.connect(SearchForm, "<TDS>?node-id=1-3146", {
  props: {
    icon: figma.instance("Select Icon 1"),
    returning: figma.enum("State", { Activated: true, Inactivated: false } as const),
  },
  example: ({ icon, returning }) => (
    <SearchForm>
      <SearchFormField
        icon={icon}
        value="Thu, 6 Aug"
        trailing={<Toggle size="small" aria-label="Add a return flight" checked={returning} />}
      />
      {returning ? <SearchFormField icon={icon} value="Sun, 9 Aug" /> : null}
    </SearchForm>
  ),
});

figma.connect(SearchForm, "<TDS>?node-id=1-3261", {
  props: {
    leadingIcon: figma.instance("Select Icon Left"),
    pieceIcon: figma.instance("Select Icon 1"),
    disabled: figma.enum("State", { Disabled: true, Active: false } as const),
    count: figma.string("Input Counter 1"),
  },
  example: ({ leadingIcon, pieceIcon, disabled, count }) => (
    <SearchForm>
      <SearchFormField
        icon={leadingIcon}
        value="1 adult"
        disabled={disabled}
        trailing={
          <>
            <Divider orientation="vertical" />
            <SearchFormPiece icon={pieceIcon} count={count} />
          </>
        }
      />
    </SearchForm>
  ),
});

/* `01 Group` is an instance rather than a set: the others, stacked, plus the submit. */
figma.connect(SearchForm, "<TDS>?node-id=1-3170", {
  example: () => (
    <>
      <SearchForm swap={<SearchFormSwapButton aria-label="Reverse route" />}>
        <SearchFormField label="From" value="Jakarta" />
        <SearchFormField label="To" value="Denpasar" />
      </SearchForm>
      <SearchForm>
        <SearchFormField value="Thu, 6 Aug" />
      </SearchForm>
      <Button>Search flights</Button>
    </>
  ),
});

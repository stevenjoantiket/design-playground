/*
 * The glyphs the kitchen sink passes into components, taken from the real drop in
 * `tds library/tds icon`.
 *
 * `?raw` rather than `?url`, unlike the Icons tab: an `<img>` can only ever show the
 * colour the file was exported with, and a glyph inside a component has to follow the
 * theme. Inlining the markup and swapping the baked fill for `currentColor` lets `Icon`
 * decide, so a search glyph is low-emphasis grey in light theme and near-white in dark
 * instead of vanishing into the sunken surface. It costs a handful of files' worth of
 * bundle, not a thousand.
 */

import { Icon, type IconColor } from "@tiket-ds/ui";

import informationSvg from "../../../tds library/tds icon/tds_ic_information.svg?raw";
import searchSvg from "../../../tds library/tds icon/tds_ic_search.svg?raw";
import ovalCrossSvg from "../../../tds library/tds icon/tds_ic_oval_cross.svg?raw";
import flightDepartSvg from "../../../tds library/tds icon/tds_ic_flight_depart.svg?raw";
import flightArrivedSvg from "../../../tds library/tds icon/tds_ic_flight_arrived.svg?raw";
import calendarSvg from "../../../tds library/tds icon/tds_ic_calendar.svg?raw";
import passengerSvg from "../../../tds library/tds icon/tds_ic_passenger.svg?raw";
import seatPlanSvg from "../../../tds library/tds icon/tds_ic_seat_plan.svg?raw";
import locationSvg from "../../../tds library/tds icon/tds_ic_location.svg?raw";
import backSvg from "../../../tds library/tds icon/tds_ic_back.svg?raw";
import promoSvg from "../../../tds library/tds icon/tds_ic_discount_tag.svg?raw";
import homeOnSvg from "../../../tds library/tds icon/tds_ic_home_on.svg?raw";
import orderHistorySvg from "../../../tds library/tds icon/tds_ic_order_history.svg?raw";
import profileOffSvg from "../../../tds library/tds icon/tds_ic_profile_off.svg?raw";
import chevronDownSvg from "../../../tds library/tds icon/tds_ic_chevron_down.svg?raw";
import departureSvg from "../../../tds library/tds icon/tds_ic_departure.svg?raw";
import discountRibbonSvg from "../../../tds library/tds icon/tds_ic_discount_ribbon.svg?raw";
import leftRightSvg from "../../../tds library/tds icon/tds_ic_left_right.svg?raw";
import plusSvg from "../../../tds library/tds icon/tds_ic_plus.svg?raw";
import fileSvg from "../../../tds library/tds icon/tds_ic_file.svg?raw";
import uploadSvg from "../../../tds library/tds icon/tds_ic_upload.svg?raw";
import chevronRightSvg from "../../../tds library/tds icon/tds_ic_chevron_right.svg?raw";
import externalLinkSvg from "../../../tds library/tds icon/tds_ic_external_link.svg?raw";
import copySvg from "../../../tds library/tds icon/tds_ic_copy.svg?raw";
import moreVerticalSvg from "../../../tds library/tds icon/tds_ic_more_vertical.svg?raw";
import deleteSvg from "../../../tds library/tds icon/tds_ic_delete.svg?raw";
import chevronUpSvg from "../../../tds library/tds icon/tds_ic_chevron_up.svg?raw";
import addImageSvg from "../../../tds library/tds icon/tds_ic_add_image.svg?raw";
import moreHorizontalSvg from "../../../tds library/tds icon/tds_ic_more_horizontal.svg?raw";
import dragDropSvg from "../../../tds library/tds icon/tds_ic_drag_drop.svg?raw";
import editSvg from "../../../tds library/tds icon/tds_ic_edit.svg?raw";
import languageSvg from "../../../tds library/tds icon/tds_ic_language.svg?raw";
import imageSvg from "../../../tds library/tds icon/tds_ic_image.svg?raw";
import checkSvg from "../../../tds library/tds icon/tds_ic_check.svg?raw";
import crossSvg from "../../../tds library/tds icon/tds_ic_cross.svg?raw";
import alertHighSvg from "../../../tds library/tds icon/tds_ic_alert_high.svg?raw";
import protectionMaxSvg from "../../../tds library/tds icon/tds_ic_protection_max.svg?raw";
import noProtectionSvg from "../../../tds library/tds icon/tds_ic_no_protection.svg?raw";
import multiplePassengerSvg from "../../../tds library/tds icon/tds_ic_multiple_passenger.svg?raw";
import homeSvg from "../../../tds library/tds icon/tds_ic_home_off.svg?raw";
import chevronLeftSvg from "../../../tds library/tds icon/tds_ic_chevron_left.svg?raw";
import gridViewSvg from "../../../tds library/tds icon/tds_ic_grid_view.svg?raw";
import bestPriceSvg from "../../../tds library/tds icon/tds_ic_best_price_guarantee.svg?raw";
import barChartSvg from "../../../tds library/tds icon/tds_ic_bar_chart.svg?raw";
import trendingSvg from "../../../tds library/tds icon/tds_ic_trending.svg?raw";
import tableSvg from "../../../tds library/tds icon/tds_ic_table.svg?raw";

/**
 * The children of the file's own `<svg>`, with every exported fill turned over to the
 * wrapping element. The outer tag is dropped rather than reused because it carries a
 * fixed `width`/`height` that would fight the size `Icon` sets.
 */
function paths(file: string): string {
  return (file.match(/<svg[^>]*>([\s\S]*)<\/svg>/)?.[1] ?? "").replace(
    /fill="#[0-9A-Fa-f]{3,8}"/g,
    'fill="currentColor"',
  );
}

export const GLYPHS = {
  information: paths(informationSvg),
  search: paths(searchSvg),
  ovalCross: paths(ovalCrossSvg),
  flightDepart: paths(flightDepartSvg),
  flightArrived: paths(flightArrivedSvg),
  calendar: paths(calendarSvg),
  passenger: paths(passengerSvg),
  seatPlan: paths(seatPlanSvg),
  location: paths(locationSvg),
  back: paths(backSvg),
  promo: paths(promoSvg),
  homeOn: paths(homeOnSvg),
  orderHistory: paths(orderHistorySvg),
  profileOff: paths(profileOffSvg),
  chevronDown: paths(chevronDownSvg),
  departure: paths(departureSvg),
  discountRibbon: paths(discountRibbonSvg),
  leftRight: paths(leftRightSvg),
  plus: paths(plusSvg),
  file: paths(fileSvg),
  upload: paths(uploadSvg),
  chevronRight: paths(chevronRightSvg),
  externalLink: paths(externalLinkSvg),
  copy: paths(copySvg),
  moreVertical: paths(moreVerticalSvg),
  delete: paths(deleteSvg),
  edit: paths(editSvg),
  language: paths(languageSvg),
  image: paths(imageSvg),
  chevronUp: paths(chevronUpSvg),
  addImage: paths(addImageSvg),
  moreHorizontal: paths(moreHorizontalSvg),
  dragDrop: paths(dragDropSvg),
  check: paths(checkSvg),
  cross: paths(crossSvg),
  alertHigh: paths(alertHighSvg),
  protectionMax: paths(protectionMaxSvg),
  noProtection: paths(noProtectionSvg),
  multiplePassenger: paths(multiplePassengerSvg),
  home: paths(homeSvg),
  chevronLeft: paths(chevronLeftSvg),
  gridView: paths(gridViewSvg),
  bestPrice: paths(bestPriceSvg),
  barChart: paths(barChartSvg),
  trending: paths(trendingSvg),
  table: paths(tableSvg),
};

export type GlyphName = keyof typeof GLYPHS;

/** Every icon in the drop is drawn on a 24px canvas; `Icon` scales it to the slot. */
const VIEW_BOX = "0 0 24 24";

export function LibraryIcon({
  name,
  size = 20,
  color = "inherit",
}: {
  name: GlyphName;
  size?: 12 | 16 | 20 | 24 | 32;
  color?: IconColor;
}) {
  return (
    <Icon size={size} color={color}>
      <svg viewBox={VIEW_BOX} dangerouslySetInnerHTML={{ __html: GLYPHS[name] }} />
    </Icon>
  );
}

export function SearchIcon() {
  return <LibraryIcon name="search" size={16} color="lowEmphasis" />;
}

export function CloseIcon() {
  return <LibraryIcon name="ovalCross" size={16} color="highEmphasis" />;
}

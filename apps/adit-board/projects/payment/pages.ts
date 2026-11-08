import { PAYMENT_PAGES } from "../../shared/projects.js";
import figmaLinks from "./data/figma-files.json";

/** The pages of the payment flow, in menu order. Instruction and Success are blank until their designs arrive. */
export const PAGES = PAYMENT_PAGES;

export type PageId = (typeof PAGES)[number]["value"];

/** The Figma file each page's designs live in; empty means none is linked yet. */
export type FigmaLinks = Record<PageId, string>;

/**
 * Which Figma file each page belongs to, read from `figma-files.json`. That file is the single
 * record: the "Figma files" card in the sidebar edits it (dev server only), and when asked to
 * create a Figma page for a page, an agent builds in the file listed there.
 */
export const FIGMA_LINKS: FigmaLinks = figmaLinks;

/** The colours a research file's dot can take on the Research page, each a token's name; "" is none. */
export const RESEARCH_COLORS = ["red", "orange", "yellow", "green", "blue", "purple"] as const;

export type ResearchColor = (typeof RESEARCH_COLORS)[number];

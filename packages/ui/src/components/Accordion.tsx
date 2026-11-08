import { useId, useState, type ReactNode } from "react";

import { ChevronDownIcon } from "../icons/index.js";
import { cx } from "../utils/cx.js";

/**
 * Figma: Type = Basic | Flat | Outline.
 * `basic` is a raised white card, `flat` has no container at all, `outline` is a white
 * card with a 1px stroke and no shadow.
 */
export type AccordionType = "basic" | "flat" | "outline";

export interface AccordionProps {
  title: ReactNode;
  children: ReactNode;
  type?: AccordionType;
  /** Leading slot — Figma places a 24px icon here. */
  startIcon?: ReactNode;
  defaultExpanded?: boolean;
  /** Pass together with `onExpandedChange` to control the component. */
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  className?: string;
}

export function Accordion({
  title,
  children,
  type = "basic",
  startIcon,
  defaultExpanded = false,
  expanded,
  onExpandedChange,
  className,
}: AccordionProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultExpanded);
  const isControlled = expanded !== undefined;
  const isExpanded = isControlled ? expanded : uncontrolled;
  const contentId = useId();

  const toggle = () => {
    if (!isControlled) setUncontrolled((current) => !current);
    onExpandedChange?.(!isExpanded);
  };

  return (
    <div
      className={cx("tds-accordion", className)}
      data-type={type}
      data-expanded={isExpanded ? "true" : undefined}
    >
      <button
        type="button"
        className="tds-accordion__header"
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={toggle}
      >
        {startIcon}
        <span className="tds-accordion__title">{title}</span>
        <span className="tds-accordion__chevron" aria-hidden="true">
          <ChevronDownIcon />
        </span>
      </button>
      <div id={contentId} className="tds-accordion__content" hidden={!isExpanded}>
        {children}
      </div>
    </div>
  );
}

import { ChevronLeftIcon, ChevronRightIcon } from "../icons/index.js";
import { cx } from "../utils/cx.js";

export interface PaginationProps {
  /** 1-based, like the numbers on the control. */
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  previousLabel?: string;
  nextLabel?: string;
}

/** Figma always draws seven cells between the arrows, however many pages there are. */
const SLOTS = 7;

/**
 * The pages to show, with `null` for an ellipsis. Reproduces the three documented states:
 * `1 2 3 4 5 … 20`, `1 … 4 5 6 … 20`, `1 … 16 17 18 19 20`.
 */
function slots(page: number, pageCount: number): (number | null)[] {
  if (pageCount <= SLOTS) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }
  if (page <= 4) {
    return [1, 2, 3, 4, 5, null, pageCount];
  }
  if (page >= pageCount - 3) {
    return [1, null, pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1, pageCount];
  }
  return [1, null, page - 1, page, page + 1, null, pageCount];
}

/**
 * Figma: Pagination (55549:1990), State = First Page | Middle Page | End Page;
 * Disabled = True | False.
 *
 * The three states are which page you are on — first, somewhere in the middle, last — and
 * each one decides where the ellipses fall and which arrow is spent. Passing `page` and
 * `pageCount` produces all three, so the control can't disagree with the list it pages.
 */
export function Pagination({
  page,
  pageCount,
  onChange,
  disabled = false,
  className,
  "aria-label": ariaLabel = "Pagination",
  previousLabel = "Previous page",
  nextLabel = "Next page",
}: PaginationProps) {
  return (
    <nav className={cx("tds-pagination", className)} aria-label={ariaLabel}>
      <button
        type="button"
        className="tds-pagination__arrow"
        aria-label={previousLabel}
        disabled={disabled || page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeftIcon />
      </button>
      {slots(page, pageCount).map((slot, index) =>
        slot === null ? (
          // Not a button: Figma ships only the Inactive type, and there is no agreed
          // behaviour for pressing it.
          <span className="tds-pagination__more" key={`gap-${index}`} aria-hidden="true">
            …
          </span>
        ) : (
          <button
            type="button"
            className="tds-pagination__page"
            key={slot}
            data-current={slot === page ? "true" : undefined}
            aria-current={slot === page ? "page" : undefined}
            aria-label={`Page ${slot}`}
            disabled={disabled}
            onClick={() => onChange(slot)}
          >
            {slot}
          </button>
        ),
      )}
      <button
        type="button"
        className="tds-pagination__arrow"
        aria-label={nextLabel}
        disabled={disabled || page >= pageCount}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRightIcon />
      </button>
    </nav>
  );
}

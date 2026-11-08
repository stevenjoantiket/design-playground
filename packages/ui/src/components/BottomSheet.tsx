import { useEffect, useId, useRef, type ReactNode } from "react";

import { cx } from "../utils/cx.js";
import { Inset } from "./Inset.js";

export interface BottomSheetProps {
  open: boolean;
  /** Called for Escape, a click on the scrim, and anything else that dismisses. */
  onClose: () => void;
  title?: ReactNode;
  /** The text link beside the title — "Reset", "Skip", "Select all". */
  link?: ReactNode;
  /** Figma limits it to two lines and allows mixed weights inside. */
  subtext?: ReactNode;
  /** Pinned below the scrolling body. Figma puts a full-width button group here. */
  footer?: ReactNode;
  /**
   * The iOS home indicator drawn under the footer in both Figma frames. Device chrome
   * rather than app UI, so it is opt-in and only belongs in a phone-framed prototype.
   */
  homeIndicator?: boolean;
  children?: ReactNode;
  className?: string;
  /** Needed when there is no `title` to label the dialog with. */
  "aria-label"?: string;
}

/**
 * Figma: `bottom sheet` (1:2627), Property 1 = Bottom Sheet - Picker | Bottom Sheet -
 * Searchable Lists, with the header from `Navigation - 03 Bottom Sheet - General` (1:2078).
 *
 * Those two variants differ only in what fills the body — a wheel picker or a search box
 * over a list — so this is the shell: scrim, grab handle, title row, scrolling body,
 * pinned footer. Put the body in as children.
 *
 * A native `<dialog>` does the modal part. Focus containment, returning focus on close,
 * making the page behind inert, Escape, and the top-layer stacking that keeps a sheet
 * above every other positioned thing on the page are all things it gets right and a div
 * with `position: fixed` does not. The scrim is painted on the dialog itself rather than
 * on `::backdrop`, so it inherits the theme like everything else.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  link,
  subtext,
  footer,
  homeIndicator = false,
  children,
  className,
  "aria-label": ariaLabel,
}: BottomSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={cx("tds-bottom-sheet", className)}
      aria-label={title ? undefined : ariaLabel}
      aria-labelledby={title ? titleId : undefined}
      // Escape fires `cancel` and would close the dialog behind React's back, leaving
      // `open` true and the sheet unopenable.
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // The dialog box is the scrim; the sheet is a child. So a click that lands on the
      // dialog itself landed outside the sheet.
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      <div className="tds-bottom-sheet__sheet">
        <div className="tds-bottom-sheet__handle" aria-hidden="true" />
        {title || link ? (
          <div className="tds-bottom-sheet__header">
            {title ? (
              <h2 className="tds-bottom-sheet__title" id={titleId}>
                {title}
              </h2>
            ) : null}
            {link ? <span className="tds-bottom-sheet__link">{link}</span> : null}
          </div>
        ) : null}
        {subtext ? <p className="tds-bottom-sheet__subtext">{subtext}</p> : null}
        <div className="tds-bottom-sheet__body">{children}</div>
        {footer ? <div className="tds-bottom-sheet__footer">{footer}</div> : null}
        {homeIndicator ? <Inset /> : null}
      </div>
    </dialog>
  );
}

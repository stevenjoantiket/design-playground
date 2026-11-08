import { useEffect, useId, useRef, type InputHTMLAttributes, type ReactNode } from "react";

import { GLYPHS, type GlyphName } from "../design-system/icons.js";
import "./portal.css";

/**
 * The portal's controls, in its own style (`portal.css`): for everything outside a device frame.
 * The mockups keep the Tiket design system; nothing here imports it.
 */

/** A glyph from the icon library, drawn in the current text colour. */
export function Icon({ name, size = 20 }: { name: GlyphName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ flex: "none" }}
      dangerouslySetInnerHTML={{ __html: GLYPHS[name] }}
    />
  );
}

/** Tabs on a grey track; the picked one is raised. */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
  className?: string;
}) {
  return (
    <div className={className ? `p-seg ${className}` : "p-seg"} role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/**
 * One choice from a short list, a row each: native radios, so arrow keys move the pick. `aside`
 * sits at the row's right end (a share, a link).
 */
export function RadioList<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string; aside?: ReactNode }[];
  value: T | undefined;
  onChange: (next: T) => void;
}) {
  const name = useId();
  return (
    <div className="p-radios" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <label key={o.value} className="p-radios__row">
          <input type="radio" name={name} checked={o.value === value} onChange={() => onChange(o.value)} />
          <span className="p-radios__label">{o.label}</span>
          {o.aside}
        </label>
      ))}
    </div>
  );
}

/** An on/off switch: a native checkbox, so it reads and works as one. */
export function Switch({ className, ...input }: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="checkbox" role="switch" className={className ? `p-switch ${className}` : "p-switch"} {...input} />;
}

/** The longest a file picker is assumed to stay open, so a missed focus event can't block the dim page for good. */
const PICKER_MAX_MS = 60_000;

/**
 * A popup on the native <dialog>: modal, focus kept inside, Escape and a click on the dim page close
 * it. Rendered only while open.
 */
export function Dialog({
  title,
  subtext,
  footer,
  onClose,
  className,
  children,
}: {
  title: ReactNode;
  subtext?: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  className?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  // A click on the dim page closes it, but only a whole click that began there (a drag that ends there, such as
  // selecting text, is not one), and not the one that dismisses a file picker: that click lands on the page.
  const pressedOnPage = useRef(false);
  const pickerUntil = useRef(0);
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    if (!dialog) return;
    const onClickCapture = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest?.('input[type="file"]')) pickerUntil.current = Date.now() + PICKER_MAX_MS;
    };
    // The picker is over once the window has focus again; keep ignoring clicks a moment longer.
    const onFocus = () => {
      if (pickerUntil.current > Date.now()) pickerUntil.current = Date.now() + 500;
    };
    dialog.addEventListener("click", onClickCapture, true);
    window.addEventListener("focus", onFocus);
    return () => {
      dialog.removeEventListener("click", onClickCapture, true);
      window.removeEventListener("focus", onFocus);
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={className ? `p-dialog portal ${className}` : "p-dialog portal"}
      aria-labelledby={titleId}
      // Escape: the browser would close it itself; the page decides instead.
      // A file input's own "cancel" (the picker's Cancel button) bubbles up to here: that one is not Escape.
      onCancel={(e) => {
        if (e.target !== e.currentTarget) return;
        e.preventDefault();
        onClose();
      }}
      // A click on the dialog element itself is a click on the dim page around the box.
      onMouseDown={(e) => {
        pressedOnPage.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && pressedOnPage.current && Date.now() > pickerUntil.current) onClose();
      }}
    >
      <div className="p-dialog__inner">
        <div className="p-dialog__head">
          <div className="p-stack">
            <h2 id={titleId} className="p-h2">
              {title}
            </h2>
            {subtext ? <p className="p-sm p-muted">{subtext}</p> : null}
          </div>
          <button type="button" className="p-icon-btn" aria-label="Close" onClick={onClose}>
            <Icon name="cross" size={18} />
          </button>
        </div>
        {children ? <div className="p-dialog__body">{children}</div> : null}
        {footer ? <div className="p-dialog__foot">{footer}</div> : null}
      </div>
    </dialog>
  );
}

/** A text input with its label above and help or the error below. */
export function Field({
  label,
  help,
  error,
  ...input
}: { label: string; help?: ReactNode; error?: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div className="p-field" data-error={error ? "" : undefined}>
      <label className="p-field__label" htmlFor={id}>
        {label}
      </label>
      <input id={id} className="p-input" aria-invalid={error ? true : undefined} aria-describedby={error || help ? `${id}-help` : undefined} {...input} />
      {error || help ? (
        <span id={`${id}-help`} className="p-field__help" role={error ? "alert" : undefined}>
          {error || help}
        </span>
      ) : null}
    </div>
  );
}

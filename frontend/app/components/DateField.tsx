import { useEffect, useId, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { AppIcon } from "./AppIcon";

const months = [
  "januar", "februar", "marts", "april", "maj", "juni",
  "juli", "august", "september", "oktober", "november", "december",
];
const weekDays = ["ma", "ti", "on", "to", "fr", "lø", "sø"];
const years = Array.from({ length: 201 }, (_, i) => 1900 + i);

function isoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(value: string): string | null {
  const source = value.trim();
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(source);
  const local = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(source);
  if (!iso && !local) return null;

  const year = Number(iso?.[1] ?? local?.[3]);
  const month = Number(iso?.[2] ?? local?.[2]);
  const day = Number(iso?.[3] ?? local?.[1]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return isoDate(date);
}

function displayDate(value: string): string {
  const parsed = parseDate(value);
  if (!parsed) return value;
  const [year, month, day] = parsed.split("-");
  return `${day}.${month}.${year}`;
}

function firstOfMonth(value: string): Date {
  const parsed = parseDate(value);
  const date = parsed ? new Date(`${parsed}T12:00:00`) : new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Own calendar popup rather than browser-native date UI:
 * the month and year remain visible and wheel scrolling cannot desynchronise them.
 * The text field accepts both Danish dd.mm.yyyy and ISO yyyy-mm-dd.
 */
export function DateField({ label, value, onChange }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const ignoreNextValueSync = useRef(false);
  const [text, setText] = useState(() => displayDate(value));
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => firstOfMonth(value));

  useEffect(() => {
    if (ignoreNextValueSync.current) {
      ignoreNextValueSync.current = false;
      return;
    }
    setText(displayDate(value));
  }, [value]);

  useEffect(() => {
    if (!open) return;
    function outsideClick(event: PointerEvent) {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", outsideClick);
    return () => document.removeEventListener("pointerdown", outsideClick);
  }, [open]);

  function edit(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    setText(next);
    ignoreNextValueSync.current = true;
    onChange(next.trim() ? (parseDate(next) ?? "") : "");
  }

  function pick(iso: string) {
    ignoreNextValueSync.current = true;
    setText(displayDate(iso));
    onChange(iso);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function changeMonth(offset: number) {
    setView(current => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  function onEscape(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && open) {
      event.stopPropagation();
      setOpen(false);
      buttonRef.current?.focus();
    }
  }

  const firstWeekDay = (view.getDay() + 6) % 7;
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((firstWeekDay + daysInMonth) / 7) * 7 }, (_, index) => {
    const day = index - firstWeekDay + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });
  const invalid = text.trim().length > 0 && !parseDate(text);

  return <div className="field date-field" ref={containerRef} onKeyDown={onEscape}>
    <label htmlFor={id}>{label}</label>
    <div className="date-input-row">
      <input id={id} type="text" inputMode="numeric" autoComplete="off"
        placeholder="dd.mm.åååå" required value={text}
        aria-invalid={invalid} aria-describedby={invalid ? `${id}-hint` : undefined}
        onChange={edit} onBlur={() => { if (parseDate(text)) setText(displayDate(text)); }} />
      <button ref={buttonRef} type="button" className="date-trigger"
        aria-label={`Åbn kalender for ${label}`} aria-expanded={open}
        onClick={() => { setView(firstOfMonth(value)); setOpen(v => !v); }}>
        <AppIcon name="calendar" size={19} />
      </button>
    </div>
    {invalid && <small id={`${id}-hint`} className="date-error">Brug en gyldig dato, f.eks. 24.10.2026.</small>}
    {open && <div className="date-popover" role="group" aria-label={`Kalender for ${label}`}>
      <div className="date-calendar-header">
        <button type="button" aria-label="Forrige måned" onClick={() => changeMonth(-1)}>‹</button>
        <select aria-label="Måned" value={view.getMonth()}
          onChange={e => setView(new Date(view.getFullYear(), Number(e.target.value), 1))}>
          {months.map((month, i) => <option key={month} value={i}>{month}</option>)}
        </select>
        <select aria-label="År" value={view.getFullYear()}
          onChange={e => setView(new Date(Number(e.target.value), view.getMonth(), 1))}>
          {years.map(year => <option key={year} value={year}>{year}</option>)}
        </select>
        <button type="button" aria-label="Næste måned" onClick={() => changeMonth(1)}>›</button>
      </div>
      <div className="date-calendar-grid">
        {weekDays.map(day => <span className="date-weekday" key={day}>{day}</span>)}
        {cells.map((day, i) => {
          if (day === null) return <span key={`empty-${i}`} aria-hidden="true" />;
          const date = isoDate(new Date(view.getFullYear(), view.getMonth(), day));
          return <button type="button" key={date}
            aria-label={`Vælg ${displayDate(date)}`}
            aria-pressed={value === date}
            className={`date-day ${value === date ? "selected" : ""} ${date === isoDate(new Date()) ? "today" : ""}`}
            onClick={() => pick(date)}>{day}</button>;
        })}
      </div>
      <div className="date-calendar-footer">
        <button type="button" onClick={() => pick(isoDate(new Date()))}>I dag</button>
      </div>
    </div>}
  </div>;
}

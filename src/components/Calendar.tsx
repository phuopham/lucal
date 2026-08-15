import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { ScheduleEntry } from '../lib/schedule';
import { parseSolarDate } from '../lib/schedule';
import { t, type Lang } from '../lib/i18n';
import { daysInSolarMonth } from '../lib/dayinfo';
import CalendarHeader from './CalendarHeader';
import Controls from './Controls';
import MonthGrid from './MonthGrid';
import YearGrid from './YearGrid';
import DayDetails from './DayDetails';
import MemorialsPanel from './MemorialsPanel';

export function dateFromQuery(search: string): Date | undefined {
  const parsed = parseSolarDate(new URLSearchParams(search).get('date') ?? undefined);
  if (!parsed) return undefined;
  return new Date(parsed.y, parsed.m - 1, parsed.d);
}

export function viewFromQuery(search: string): 'month' | 'year' | undefined {
  const v = new URLSearchParams(search).get('view');
  return v === 'year' || v === 'month' ? v : undefined;
}

export default function Calendar({
  schedules,
  initialDate,
  initialView,
}: {
  schedules: ScheduleEntry[];
  initialDate?: Date;
  initialView?: 'month' | 'year';
}) {
  const [selected, setSelected] = useState<Date>(() => {
    const base =
      initialDate ?? (typeof window !== 'undefined' ? dateFromQuery(window.location.search) : undefined) ?? new Date();
    const y = Math.max(1400, Math.min(3000, base.getFullYear()));
    const max = daysInSolarMonth(y, base.getMonth() + 1);
    return new Date(y, base.getMonth(), Math.min(base.getDate(), max));
  });
  const [view, setView] = useState<'month' | 'year'>(
    initialView ?? (typeof window !== 'undefined' ? viewFromQuery(window.location.search) : undefined) ?? 'month',
  );
  const [lang, setLang] = useState<Lang>('vi');
  const cardRef = useRef<HTMLDivElement>(null);
  const touchX = useRef(0);

  const year = selected.getFullYear();
  const month = selected.getMonth() + 1;

  const shiftDay = useCallback((n: number) => {
    setSelected((s) => {
      const ns = new Date(s);
      ns.setDate(ns.getDate() + n);
      return ns;
    });
  }, []);

  const shiftMonth = useCallback((n: number) => {
    setSelected((s) => {
      const d0 = new Date(s.getFullYear(), s.getMonth() + n, 1);
      const max = daysInSolarMonth(d0.getFullYear(), d0.getMonth() + 1);
      return new Date(d0.getFullYear(), d0.getMonth(), Math.min(s.getDate(), max));
    });
    setView('month');
  }, []);

  const shiftYear = useCallback((n: number) => {
    setSelected((s) => {
      const y = Math.max(1400, Math.min(3000, s.getFullYear() + n));
      const max = daysInSolarMonth(y, s.getMonth() + 1);
      return new Date(y, s.getMonth(), Math.min(s.getDate(), max));
    });
  }, []);

  const goTo = useCallback((y: number, m: number) => {
    setSelected((s) => {
      const max = daysInSolarMonth(y, m);
      return new Date(y, m - 1, Math.min(s.getDate(), max));
    });
    setView('month');
  }, []);

  const goToday = useCallback(() => {
    setSelected(new Date());
    setView('month');
  }, []);

  const selectDate = useCallback((d: Date) => {
    setSelected(d);
    setView('month');
  }, []);

  const toggleLang = useCallback(() => setLang((l) => (l === 'vi' ? 'en' : 'vi')), []);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const onKey = (ev: KeyboardEvent) => {
      let handled = true;
      if (view === 'month') {
        switch (ev.key) {
          case 'ArrowLeft': shiftDay(-1); break;
          case 'ArrowRight': shiftDay(1); break;
          case 'ArrowUp': shiftDay(-7); break;
          case 'ArrowDown': shiftDay(7); break;
          case 'PageUp': shiftMonth(-1); break;
          case 'PageDown': shiftMonth(1); break;
          case 'Home': shiftYear(-1); break;
          case 'End': shiftYear(1); break;
          default: handled = false;
        }
      } else {
        switch (ev.key) {
          case 'ArrowLeft': shiftYear(-1); break;
          case 'ArrowRight': shiftYear(1); break;
          case 'PageUp': shiftYear(-1); break;
          case 'PageDown': shiftYear(1); break;
          default: handled = false;
        }
      }
      if (handled) ev.preventDefault();
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [view, shiftDay, shiftMonth, shiftYear]);

  useEffect(() => {
    const y = selected.getFullYear();
    const m = String(selected.getMonth() + 1).padStart(2, '0');
    const d = String(selected.getDate()).padStart(2, '0');
    const params = new URLSearchParams();
    params.set('date', `${y}-${m}-${d}`);
    if (view === 'year') params.set('view', 'year');
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }, [selected, view]);

  return (
    <div className="layout">
      <div
        className="cal-card"
        ref={cardRef}
        tabIndex={0}
        role="application"
        aria-label="Lunar calendar"
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 60) shiftMonth(dx < 0 ? 1 : -1);
        }}
      >
        <CalendarHeader selected={selected} view={view} year={year} month={month} lang={lang} />
        <Controls
          year={year}
          month={month}
          view={view}
          lang={lang}
          onMonthShift={shiftMonth}
          onYearShift={shiftYear}
          onToday={goToday}
          onView={setView}
          onLang={toggleLang}
          onGoTo={goTo}
        />
        <div className="cal-body">
          {view === 'month' ? (
            <MonthGrid year={year} month={month} selected={selected} lang={lang} schedules={schedules} onSelect={selectDate} />
          ) : (
            <YearGrid year={year} month={month} selected={selected} lang={lang} schedules={schedules} onSelect={selectDate} onGoTo={goTo} />
          )}
        </div>
        <DayDetails selected={selected} lang={lang} schedules={schedules} />
        <footer className="cal-footer">{t(lang, 'keyboardHint')}</footer>
      </div>
      <MemorialsPanel schedules={schedules} year={year} month={month} lang={lang} />
    </div>
  );
}
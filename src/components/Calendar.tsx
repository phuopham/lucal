import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { ScheduleEntry } from '../lib/schedule';
import { parseSolarDate } from '../lib/schedule';
import { convertSolar2Lunar, convertLunar2Solar, daysInLunarMonth } from '../lib/lunar';
import { clampLunarMonth, nextLunarMonth, prevLunarMonth } from '../lib/lunar-nav';
import { t, type Lang } from '../lib/i18n';
import { daysInSolarMonth } from '../lib/dayinfo';
import CalendarHeader from './CalendarHeader';
import Controls from './Controls';
import MonthGrid from './MonthGrid';
import YearGrid from './YearGrid';
import LunarMonthGrid from './LunarMonthGrid';
import LunarYearGrid from './LunarYearGrid';
import DayDetails from './DayDetails';
import MemorialsPanel from './MemorialsPanel';

export type View = 'month' | 'year' | 'lmonth' | 'lyear';

export function dateFromQuery(search: string): Date | undefined {
  const parsed = parseSolarDate(new URLSearchParams(search).get('date') ?? undefined);
  if (!parsed) return undefined;
  return new Date(parsed.y, parsed.m - 1, parsed.d);
}

export function viewFromQuery(search: string): View | undefined {
  const v = new URLSearchParams(search).get('view');
  return v === 'year' || v === 'month' || v === 'lmonth' || v === 'lyear' ? (v as View) : undefined;
}

export default function Calendar({
  schedules,
  initialDate,
  initialView,
}: {
  schedules: ScheduleEntry[];
  initialDate?: Date;
  initialView?: View;
}) {
  const [selected, setSelected] = useState<Date>(() => {
    const base =
      initialDate ?? (typeof window !== 'undefined' ? dateFromQuery(window.location.search) : undefined) ?? new Date();
    const y = Math.max(1400, Math.min(3000, base.getFullYear()));
    const max = daysInSolarMonth(y, base.getMonth() + 1);
    return new Date(y, base.getMonth(), Math.min(base.getDate(), max));
  });
  const [view, setView] = useState<View>(
    initialView ?? (typeof window !== 'undefined' ? viewFromQuery(window.location.search) : undefined) ?? 'month',
  );
  const [lang, setLang] = useState<Lang>('vi');
  const cardRef = useRef<HTMLDivElement>(null);
  const touchX = useRef(0);

  const year = selected.getFullYear();
  const month = selected.getMonth() + 1;
  const isLunar = view === 'lmonth' || view === 'lyear';
  const selLunar = convertSolar2Lunar(selected.getDate(), month, year);
  const pos = clampLunarMonth(selLunar.year, selLunar.month, selLunar.leap);
  const lYear = pos.year;
  const lMonth = pos.month;
  const lLeap = pos.leap;
  const ctlYear = isLunar ? lYear : year;
  const ctlMonth = isLunar ? lMonth : month;
  const ctlLeap = isLunar ? lLeap : false;

  const solarForLunar = useCallback((y: number, m: number, leap: boolean, day: number): Date | null => {
    const max = daysInLunarMonth(m, y, leap);
    const solar = convertLunar2Solar(Math.min(day, max), m, y, leap);
    return solar ? new Date(solar[2], solar[1] - 1, solar[0]) : null;
  }, []);

  const shiftDay = useCallback((n: number) => {
    setSelected((s) => {
      const ns = new Date(s);
      ns.setDate(ns.getDate() + n);
      return ns;
    });
  }, []);

  const shiftMonth = useCallback(
    (n: number) => {
      if (!isLunar) {
        setSelected((s) => {
          const d0 = new Date(s.getFullYear(), s.getMonth() + n, 1);
          const max = daysInSolarMonth(d0.getFullYear(), d0.getMonth() + 1);
          return new Date(d0.getFullYear(), d0.getMonth(), Math.min(s.getDate(), max));
        });
        setView('month');
        return;
      }
      const nxt = n > 0 ? nextLunarMonth(lYear, lMonth, lLeap) : prevLunarMonth(lYear, lMonth, lLeap);
      const d = solarForLunar(nxt.year, nxt.month, nxt.leap, selLunar.day);
      if (d) setSelected(d);
      setView('lmonth');
    },
    [isLunar, lYear, lMonth, lLeap, selLunar.day, solarForLunar],
  );

  const shiftYear = useCallback(
    (n: number) => {
      if (!isLunar) {
        setSelected((s) => {
          const y = Math.max(1400, Math.min(3000, s.getFullYear() + n));
          const max = daysInSolarMonth(y, s.getMonth() + 1);
          return new Date(y, s.getMonth(), Math.min(s.getDate(), max));
        });
        return;
      }
      const pos2 = clampLunarMonth(lYear + n, lMonth, lLeap);
      const d = solarForLunar(pos2.year, pos2.month, pos2.leap, selLunar.day);
      if (d) setSelected(d);
    },
    [isLunar, lYear, lMonth, lLeap, selLunar.day, solarForLunar],
  );

  const goTo = useCallback(
    (y: number, m: number, leap = false) => {
      if (!isLunar) {
        setSelected((s) => {
          const max = daysInSolarMonth(y, m);
          return new Date(y, m - 1, Math.min(s.getDate(), max));
        });
        setView('month');
        return;
      }
      const pos2 = clampLunarMonth(y, m, leap);
      const d = solarForLunar(pos2.year, pos2.month, pos2.leap, selLunar.day);
      if (d) setSelected(d);
      setView('lmonth');
    },
    [isLunar, selLunar.day, solarForLunar],
  );

  const goLunarMonth = useCallback(
    (y: number, m: number, leap: boolean) => {
      const pos2 = clampLunarMonth(y, m, leap);
      const d = solarForLunar(pos2.year, pos2.month, pos2.leap, 1);
      if (d) setSelected(d);
      setView('lmonth');
    },
    [solarForLunar],
  );

  const goToday = useCallback(() => {
    setSelected(new Date());
    setView(isLunar ? 'lmonth' : 'month');
  }, [isLunar]);

  const selectDate = useCallback((d: Date) => {
    setSelected(d);
    setView('month');
  }, []);

  const selectDateLunar = useCallback((d: Date) => {
    setSelected(d);
  }, []);

  const toggleLang = useCallback(() => setLang((l) => (l === 'vi' ? 'en' : 'vi')), []);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const onKey = (ev: KeyboardEvent) => {
      let handled = true;
      if (view === 'month' || view === 'lmonth') {
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
    if (view !== 'month') params.set('view', view);
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
        <CalendarHeader selected={selected} view={view} year={year} month={month} lYear={lYear} lMonth={lMonth} lLeap={lLeap} lang={lang} />
        <Controls
          year={ctlYear}
          month={ctlMonth}
          leap={ctlLeap}
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
          {view === 'month' && <MonthGrid year={year} month={month} selected={selected} lang={lang} schedules={schedules} onSelect={selectDate} />}
          {view === 'year' && <YearGrid year={year} month={month} selected={selected} lang={lang} schedules={schedules} onSelect={selectDate} onGoTo={goTo} />}
          {view === 'lmonth' && <LunarMonthGrid year={lYear} month={lMonth} leap={lLeap} selected={selected} lang={lang} schedules={schedules} onSelect={selectDateLunar} />}
          {view === 'lyear' && <LunarYearGrid year={lYear} curMonth={lMonth} curLeap={lLeap} schedules={schedules} lang={lang} onGoMonth={goLunarMonth} />}
        </div>
        <DayDetails selected={selected} lang={lang} schedules={schedules} />
        <footer className="cal-footer">{t(lang, 'keyboardHint')}</footer>
      </div>
      <MemorialsPanel schedules={schedules} year={isLunar ? lYear : year} lunar={isLunar} hlMonth={isLunar ? lMonth : month} lang={lang} />
    </div>
  );
}
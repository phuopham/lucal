import React from 'react';
import { type Lang, WEEKDAYS_SHORT } from '../lib/i18n';
import { lunarMonthDays } from '../lib/dayinfo';
import { getWeekday } from '../lib/lunar';
import type { ScheduleEntry } from '../lib/schedule';
import LunarDayCell from './LunarDayCell';

export default function LunarMonthGrid({
  year,
  month,
  leap,
  selected,
  lang,
  schedules,
  onSelect,
}: {
  year: number;
  month: number;
  leap: boolean;
  selected: Date;
  lang: Lang;
  schedules: ScheduleEntry[];
  onSelect: (d: Date) => void;
}) {
  const days = lunarMonthDays(schedules, year, month, leap);
  const cells: React.ReactNode[] = [];
  const offset = days.length ? (getWeekday(days[0].jd) + 6) % 7 : 0;
  for (let i = 0; i < offset; i++) {
    cells.push(<div key={`e${i}`} className="day-cell empty" />);
  }
  for (const d of days) {
    cells.push(<LunarDayCell key={d.jd} info={d} selected={selected} lang={lang} onSelect={onSelect} />);
  }
  const gridRow = Math.ceil((offset + cells.length) / 7);
  for (let i = cells.length; i < gridRow * 7; i++) {
    cells.push(<div key={`t${i}`} className="day-cell empty" />);
  }

  return (
    <>
      <div className="week-row">
        {WEEKDAYS_SHORT[lang].map((w) => (
          <div key={w} className="wd">{w}</div>
        ))}
      </div>
      <div className="grid">{cells}</div>
    </>
  );
}
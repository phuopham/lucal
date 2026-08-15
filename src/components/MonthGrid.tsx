import React from 'react';
import { type Lang, WEEKDAYS_SHORT } from '../lib/i18n';
import { monthDays } from '../lib/dayinfo';
import type { ScheduleEntry } from '../lib/schedule';
import DayCell from './DayCell';

export default function MonthGrid({
  year,
  month,
  selected,
  lang,
  schedules,
  onSelect,
}: {
  year: number;
  month: number;
  selected: Date;
  lang: Lang;
  schedules: ScheduleEntry[];
  onSelect: (d: Date) => void;
}) {
  const days = monthDays(year, month, schedules);
  const offset = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const cells: React.ReactNode[] = [];
  for (let i = 0; i < offset; i++) {
    cells.push(<div key={`e${i}`} className="day-cell empty" />);
  }
  for (const d of days) {
    cells.push(<DayCell key={d.jd} info={d} selected={selected} lang={lang} onSelect={onSelect} />);
  }
  const gridRow = Math.ceil((offset + days.length) / 7);
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
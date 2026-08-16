import React from 'react';
import { type Lang, LUNAR_MONTHS, WEEKDAYS, t } from '../lib/i18n';
import { lunarMonthDays, lunarMonthSequence } from '../lib/dayinfo';
import { getWeekday } from '../lib/lunar';
import { fmtSolar, lunarDayName } from '../lib/format';
import { lunarPrimaryLabel } from './LunarDayCell';
import type { ScheduleEntry } from '../lib/schedule';

export default function LunarYearGrid({
  year,
  curMonth,
  curLeap,
  schedules,
  lang,
  onGoMonth,
}: {
  year: number;
  curMonth: number;
  curLeap: boolean;
  schedules: ScheduleEntry[];
  lang: Lang;
  onGoMonth: (y: number, m: number, leap: boolean) => void;
}) {
  const monthDefs = lunarMonthSequence(year)
    .map((def) => ({ ...def, days: lunarMonthDays(schedules, year, def.month, def.leap) }))
    .filter((x) => x.days.length > 0);
  const monthsHtml: React.ReactNode[] = [];
  for (const { month, leap, days } of monthDefs) {
    const offset = days.length ? (getWeekday(days[0].jd) + 6) % 7 : 0;
    const leTxt = leap ? ` ${t(lang, 'leapShort')}` : '';
    const title = `${t(lang, 'month')} ${LUNAR_MONTHS[lang][month]}${leTxt}`;
    const active = month === curMonth && leap === curLeap ? ' active' : '';
    const cells: React.ReactNode[] = [];
    for (let i = 0; i < offset; i++) cells.push(<span key={`e${i}`} className="yc empty" />);
    for (const d of days) {
      const tip = `${WEEKDAYS[lang][getWeekday(d.jd)]} · ${fmtSolar(lang, d.d, d.m, d.y)} · ${lunarDayName(lang, d.lunar.day)} tháng ${LUNAR_MONTHS[lang][d.lunar.month]}${d.lunar.leap ? ` ${t(lang, 'leapShort')}` : ''}${d.schedules.length ? ` · ${d.schedules.map((s) => s.title).join(', ')}` : ''}`;
      cells.push(
        <button key={d.jd} type="button" className="yc lyc" data-jd={d.jd} title={tip} aria-label={String(d.lunar.day)} onClick={() => onGoMonth(d.lunar.year, d.lunar.month, d.lunar.leap)}>
          <span className={`lyc-lunar${d.lunar.day === 15 ? ' full' : ''}`}>{lunarPrimaryLabel(d.lunar.day)}</span>
          <span className="lyc-solar">{d.d}</span>
        </button>,
      );
    }
    for (let i = cells.length; i < Math.ceil(cells.length / 7) * 7; i++) {
      cells.push(<span key={`t${i}`} className="yc empty" />);
    }
    monthsHtml.push(
      <div key={`${month}-${leap}`} className={`ym${active}`}>
        <div className="ym-title">{title}</div>
        <div className="lym-grid">{cells}</div>
      </div>,
    );
  }
  return <div className="year-grid">{monthsHtml}</div>;
}
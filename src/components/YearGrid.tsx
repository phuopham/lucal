import React from 'react';
import { type Lang, MONTHS_SHORT, WEEKDAYS, LUNAR_MONTHS, t, formatLunar } from '../lib/i18n';
import { monthDays } from '../lib/dayinfo';
import { getWeekday } from '../lib/lunar';
import { fmtSolar, lunarDayName } from '../lib/format';
import type { ScheduleEntry } from '../lib/schedule';

export default function YearGrid({
  year,
  month,
  selected,
  lang,
  schedules,
  onSelect,
  onGoTo,
}: {
  year: number;
  month: number;
  selected: Date;
  lang: Lang;
  schedules: ScheduleEntry[];
  onSelect: (d: Date) => void;
  onGoTo: (y: number, m: number) => void;
}) {
  const monthsHtml = [];
  for (let m = 1; m <= 12; m++) {
    const info = monthDays(year, m, schedules);
    const offset = (new Date(year, m - 1, 1).getDay() + 6) % 7;
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push(<span key={`e${i}`} className="yc empty" />);
    for (const d of info) {
      const selThis =
        selected.getFullYear() === d.y && selected.getMonth() + 1 === d.m && selected.getDate() === d.d;
      const cls = ['yc', d.isToday ? 'today' : '', selThis ? 'sel' : '', d.god.hoang ? 'hoang' : '']
        .filter(Boolean)
        .join(' ');
      const lun =
        d.lunar.day === 1
          ? `${d.lunar.leap ? `${t(lang, 'leapShort')} ` : ''}${formatLunar(d.lunar.day, d.lunar.month)}`
          : String(d.lunar.day);
      const tip = `${WEEKDAYS[lang][getWeekday(d.jd)]} · ${fmtSolar(lang, d.d, m, year)} · ${lunarDayName(lang, d.lunar.day)} tháng ${LUNAR_MONTHS[lang][d.lunar.month]}${d.lunar.leap ? ` ${t(lang, 'leapShort')}` : ''}${d.schedules.length ? ` · ${d.schedules.map((s) => s.title).join(', ')}` : ''}`;
      cells.push(
        <button key={d.jd} type="button" className={cls} data-jd={d.jd} title={tip} aria-label={String(d.d)} onClick={() => onSelect(new Date(d.y, d.m - 1, d.d))}>
          <span className="ys">{d.d}{d.schedules.length ? <i className="dot" /> : ''}</span>
          <span className="yl">{lun}</span>
        </button>,
      );
    }
    const active = month === m ? ' active' : '';
    const mTitle = lang === 'vi' ? `Tháng ${m}` : MONTHS_SHORT[lang][m - 1];
    monthsHtml.push(
      <div key={m} className={`ym${active}`} onClick={() => onGoTo(year, m)}>
        <div className="ym-title">{mTitle}</div>
        <div className="ym-grid">{cells}</div>
      </div>,
    );
  }

  return <div className="year-grid">{monthsHtml}</div>;
}
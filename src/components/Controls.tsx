import React from 'react';
import { type Lang, MONTHS, LUNAR_MONTHS, t } from '../lib/i18n';
import { convertSolar2Lunar, getLunarMonth1 } from '../lib/lunar';
import type { View } from './Calendar';

export default function Controls({
  year,
  month,
  leap,
  view,
  lang,
  onMonthShift,
  onYearShift,
  onToday,
  onView,
  onLang,
  onGoTo,
}: {
  year: number;
  month: number;
  leap: boolean;
  view: View;
  lang: Lang;
  onMonthShift: (n: number) => void;
  onYearShift: (n: number) => void;
  onToday: () => void;
  onView: (v: View) => void;
  onLang: () => void;
  onGoTo: (y: number, m: number, leap: boolean) => void;
}) {
  const isLunar = view === 'lmonth' || view === 'lyear';
  const today = new Date();
  const todayLunar = convertSolar2Lunar(today.getDate(), today.getMonth() + 1, today.getFullYear());

  const yMinBase = isLunar ? todayLunar.year : today.getFullYear();
  const yOpts: number[] = [];
  for (let y = yMinBase + 30; y >= yMinBase - 200; y--) yOpts.push(y);

  const viewSpecs: { v: View; act: string; label: string }[] = [
    { v: 'month', act: 'view-month', label: t(lang, 'monthView') },
    { v: 'year', act: 'view-year', label: t(lang, 'yearView') },
    { v: 'lmonth', act: 'view-lmonth', label: t(lang, 'lunarMonthView') },
    { v: 'lyear', act: 'view-lyear', label: t(lang, 'lunarYearView') },
  ];

  const mLabel = (m: number): string => {
    const hasLeap = isLunar && getLunarMonth1(m, year, true) !== null;
    if (isLunar) return `${LUNAR_MONTHS[lang][m]}${hasLeap ? ` (${t(lang, 'leapShort')})` : ''}`;
    return MONTHS[lang][m - 1];
  };

  return (
    <div className="controls">
      <div className="nav-group">
        <button type="button" className="btn" data-act="year-prev" title={t(lang, 'prevYear')} onClick={() => onYearShift(-1)}>«</button>
        <button type="button" className="btn" data-act="month-prev" title={t(lang, 'prevMonth')} onClick={() => onMonthShift(-1)}>‹</button>
        <select className="sel sel-month" data-act="month-select" aria-label={t(lang, 'month')} value={month} onChange={(e) => onGoTo(year, Number(e.target.value), false)}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
            <option key={m} value={m}>{mLabel(m)}</option>
          ))}
        </select>
        <select className="sel sel-year" data-act="year-select" aria-label={isLunar ? t(lang, 'lunarYearLabel') : t(lang, 'lunarYear')} value={year} onChange={(e) => onGoTo(Number(e.target.value), month, leap)}>
          {yOpts.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button type="button" className="btn" data-act="month-next" title={t(lang, 'nextMonth')} onClick={() => onMonthShift(1)}>›</button>
        <button type="button" className="btn" data-act="year-next" title={t(lang, 'nextYear')} onClick={() => onYearShift(1)}>»</button>
      </div>
      <div className="nav-group">
        <button type="button" className="btn today-btn" data-act="today" title={t(lang, 'backToday')} onClick={onToday}>{t(lang, 'today')}</button>
        <div className="seg seg-4" role="tablist">
          {viewSpecs.map(({ v, act, label }) => (
            <button key={v} type="button" className={`seg-btn${view === v ? ' on' : ''}`} data-act={act} onClick={() => onView(v)}>{label}</button>
          ))}
        </div>
        <button type="button" className="btn lang-btn" data-act="lang" title={t(lang, 'langTitle')} onClick={onLang}>{t(lang, 'langName')}</button>
      </div>
    </div>
  );
}
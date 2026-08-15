import React from 'react';
import { type Lang, MONTHS, t } from '../lib/i18n';

export default function Controls({
  year,
  month,
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
  view: 'month' | 'year';
  lang: Lang;
  onMonthShift: (n: number) => void;
  onYearShift: (n: number) => void;
  onToday: () => void;
  onView: (v: 'month' | 'year') => void;
  onLang: () => void;
  onGoTo: (y: number, m: number) => void;
}) {
  const today = new Date();
  const yMin = today.getFullYear() - 200;
  const yMax = today.getFullYear() + 30;
  const yOpts: number[] = [];
  for (let y = yMax; y >= yMin; y--) yOpts.push(y);

  return (
    <div className="controls">
      <div className="nav-group">
        <button type="button" className="btn" data-act="year-prev" title={t(lang, 'prevYear')} onClick={() => onYearShift(-1)}>«</button>
        <button type="button" className="btn" data-act="month-prev" title={t(lang, 'prevMonth')} onClick={() => onMonthShift(-1)}>‹</button>
        <select className="sel sel-month" data-act="month-select" aria-label={t(lang, 'month')} value={month} onChange={(e) => onGoTo(year, Number(e.target.value))}>
          {MONTHS[lang].map((name, i) => (
            <option key={i} value={i + 1}>{name}</option>
          ))}
        </select>
        <select className="sel sel-year" data-act="year-select" aria-label={t(lang, 'lunarYear')} value={year} onChange={(e) => onGoTo(Number(e.target.value), month)}>
          {yOpts.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button type="button" className="btn" data-act="month-next" title={t(lang, 'nextMonth')} onClick={() => onMonthShift(1)}>›</button>
        <button type="button" className="btn" data-act="year-next" title={t(lang, 'nextYear')} onClick={() => onYearShift(1)}>»</button>
      </div>
      <div className="nav-group">
        <button type="button" className="btn today-btn" data-act="today" title={t(lang, 'backToday')} onClick={onToday}>{t(lang, 'today')}</button>
        <div className="seg" role="tablist">
          <button type="button" className={`seg-btn${view === 'month' ? ' on' : ''}`} data-act="view-month" onClick={() => onView('month')}>{t(lang, 'monthView')}</button>
          <button type="button" className={`seg-btn${view === 'year' ? ' on' : ''}`} data-act="view-year" onClick={() => onView('year')}>{t(lang, 'yearView')}</button>
        </div>
        <button type="button" className="btn lang-btn" data-act="lang" title={t(lang, 'langTitle')} onClick={onLang}>{t(lang, 'langName')}</button>
      </div>
    </div>
  );
}
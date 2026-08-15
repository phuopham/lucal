import React from 'react';
import {
  type Lang,
  MONTHS,
  LUNAR_MONTHS,
  canChiName,
  lunarMonthName,
  t,
} from '../lib/i18n';
import { convertSolar2Lunar, getYearCanChi } from '../lib/lunar';
import { lunarDayName } from '../lib/format';

export default function CalendarHeader({
  selected,
  view,
  year,
  month,
  lang,
}: {
  selected: Date;
  view: 'month' | 'year';
  year: number;
  month: number;
  lang: Lang;
}) {
  const selLunar = convertSolar2Lunar(selected.getDate(), selected.getMonth() + 1, selected.getFullYear());
  const yearChi = getYearCanChi(selLunar.year);

  const title =
    view === 'month'
      ? lang === 'vi'
        ? `${MONTHS[lang][month - 1]} năm ${year}`
        : `${MONTHS[lang][month - 1]} ${year}`
      : lang === 'vi'
        ? `Năm ${year}`
        : `Year ${year}`;

  const leapTxt = selLunar.leap ? ` ${t(lang, 'leapShort')}` : '';
  const subtitle =
    lang === 'vi'
      ? `Âm lịch: tháng ${LUNAR_MONTHS[lang][selLunar.month]}${leapTxt} · ${lunarDayName(lang, selLunar.day)} · Năm ${canChiName(lang, yearChi.can, yearChi.chi)}`
      : `Lunar: ${lunarMonthName(lang, selLunar.month, selLunar.leap)} lunar month · ${lunarDayName(lang, selLunar.day)} · ${canChiName(lang, yearChi.can, yearChi.chi)} year`;

  return (
    <header className="cal-header">
      <h1 className="cal-title">{title}</h1>
      <div className="cal-subtitle">{subtitle}</div>
    </header>
  );
}
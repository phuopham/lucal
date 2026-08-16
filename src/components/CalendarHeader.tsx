import React from 'react';
import {
  type Lang,
  MONTHS,
  LUNAR_MONTHS,
  WEEKDAYS,
  canChiName,
  lunarMonthName,
  t,
} from '../lib/i18n';
import { convertSolar2Lunar, getYearCanChi, getWeekday, jdFromDate } from '../lib/lunar';
import { fmtSolar, lunarDayName } from '../lib/format';

export default function CalendarHeader({
  selected,
  view,
  year,
  month,
  lYear,
  lMonth,
  lLeap,
  lang,
}: {
  selected: Date;
  view: 'month' | 'year' | 'lmonth' | 'lyear';
  year: number;
  month: number;
  lYear: number;
  lMonth: number;
  lLeap: boolean;
  lang: Lang;
}) {
  const selJd = jdFromDate(selected.getDate(), selected.getMonth() + 1, selected.getFullYear());
  const selLunar = convertSolar2Lunar(selected.getDate(), selected.getMonth() + 1, selected.getFullYear());
  const selWeekday = WEEKDAYS[lang][getWeekday(selJd)];
  const solarThis = fmtSolar(lang, selected.getDate(), selected.getMonth() + 1, selected.getFullYear());

  const yearChi = getYearCanChi(view === 'lmonth' || view === 'lyear' ? lYear : selLunar.year);

  let title: string;
  let subtitle: string;
  if (view === 'month') {
    title = lang === 'vi' ? `${MONTHS[lang][month - 1]} năm ${year}` : `${MONTHS[lang][month - 1]} ${year}`;
  } else if (view === 'year') {
    title = lang === 'vi' ? `Năm ${year}` : `Year ${year}`;
  } else if (view === 'lmonth') {
    const leapTxt = lLeap ? ` ${t(lang, 'leapShort')}` : '';
    title =
      lang === 'vi'
        ? `Tháng ${LUNAR_MONTHS[lang][lMonth]}${leapTxt} · Năm ${lYear}`
        : `${lunarMonthName(lang, lMonth, lLeap)} lunar month · ${lYear}`;
  } else {
    title = lang === 'vi' ? `Năm ${lYear}` : `Lunar Year ${lYear}`;
  }

  if (view === 'month') {
    const leapTxt = selLunar.leap ? ` ${t(lang, 'leapShort')}` : '';
    subtitle =
      lang === 'vi'
        ? `Âm lịch: tháng ${LUNAR_MONTHS[lang][selLunar.month]}${leapTxt} · ${lunarDayName(lang, selLunar.day)} · Năm ${canChiName(lang, yearChi.can, yearChi.chi)}`
        : `Lunar: ${lunarMonthName(lang, selLunar.month, selLunar.leap)} lunar month · ${lunarDayName(lang, selLunar.day)} · ${canChiName(lang, yearChi.can, yearChi.chi)} year`;
  } else if (view === 'year') {
    subtitle =
      lang === 'vi'
        ? `${lunarDayName(lang, selLunar.day)} tháng ${LUNAR_MONTHS[lang][selLunar.month]}${selLunar.leap ? ` ${t(lang, 'leapShort')}` : ''} · Năm ${canChiName(lang, yearChi.can, yearChi.chi)}`
        : `${lunarDayName(lang, selLunar.day)} ${lunarMonthName(lang, selLunar.month, selLunar.leap)} · ${canChiName(lang, yearChi.can, yearChi.chi)} year`;
  } else {
    subtitle =
      lang === 'vi'
        ? `Dương lịch: ${solarThis} · ${selWeekday}`
        : `Solar: ${solarThis} · ${selWeekday}`;
  }

  return (
    <header className="cal-header">
      <h1 className="cal-title">{title}</h1>
      <div className="cal-subtitle">{subtitle}</div>
    </header>
  );
}
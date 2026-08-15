import React from 'react';
import { type Lang, LUNAR_MONTHS, TERMS, GOD_NAMES, HOLIDAYS, CHI, WEEKDAYS, EVENT_TYPES, canChiName, t } from '../lib/i18n';
import { convertSolar2Lunar, jdFromDate, getDayCanChi, getYearCanChi, getLunarMonthCanChi, getWeekday, getSolarTermIndex, getDayGod, getHoliday, isHoangDaoHour, isLastDayOfLunarYear } from '../lib/lunar';
import { schedulesOnDay, type ScheduleEntry } from '../lib/schedule';
import { fmtSolar, lunarDayName, hourRange, goodLabel } from '../lib/format';

export default function DayDetails({
  selected,
  lang,
  schedules,
}: {
  selected: Date;
  lang: Lang;
  schedules: ScheduleEntry[];
}) {
  const selLunar = convertSolar2Lunar(selected.getDate(), selected.getMonth() + 1, selected.getFullYear());
  const selJd = jdFromDate(selected.getDate(), selected.getMonth() + 1, selected.getFullYear());
  const selWeek = getWeekday(selJd);
  const selChi = getDayCanChi(selJd);
  const yearChi = getYearCanChi(selLunar.year);
  const monthChi = getLunarMonthCanChi(selLunar.year, selLunar.month);
  const selTerm = getSolarTermIndex(selJd);
  const selGod = getDayGod(selLunar.day, selChi.chi);

  const leapTxt = selLunar.leap ? ` ${t(lang, 'leapShort')}` : '';
  const leapMonthTxt = selLunar.leap ? ` (${t(lang, 'leap')})` : '';

  const holidayNames: string[] = [];
  const hol = getHoliday(selLunar);
  if (hol) holidayNames.push(HOLIDAYS[lang][hol.id]);
  if (selLunar.day === 15) holidayNames.push(t(lang, 'fullMoon'));
  if (selLunar.day === 1) holidayNames.push(t(lang, 'newMoon'));
  if (isLastDayOfLunarYear(selLunar)) holidayNames.push(t(lang, 'newYearEve'));

  const goodHours: string[] = [];
  for (let h = 0; h < 12; h++) {
    if (isHoangDaoHour(h, selChi.chi)) {
      const hourStart = (h * 2 + 23) % 24;
      goodHours.push(`${hourRange(hourStart)} ${CHI[lang][h]}`);
    }
  }

  const selSchedules = schedulesOnDay(schedules, {
    d: selected.getDate(),
    m: selected.getMonth() + 1,
    y: selected.getFullYear(),
    ld: selLunar.day,
    lm: selLunar.month,
  });

  return (
    <div className="details">
      <div className="detail-main">
        <div className="detail-big">{fmtSolar(lang, selected.getDate(), selected.getMonth() + 1, selected.getFullYear())}</div>
        <div className="detail-lunar">
          {lunarDayName(lang, selLunar.day)} tháng {LUNAR_MONTHS[lang][selLunar.month]}
          {leapTxt}, Năm {canChiName(lang, yearChi.can, yearChi.chi)} · {WEEKDAYS[lang][selWeek]}
        </div>
      </div>
      <div className="detail-rows">
        <div className="row"><span className="k">{t(lang, 'canChiDay')}</span><span className="v">{canChiName(lang, selChi.can, selChi.chi)}</span></div>
        <div className="row"><span className="k">{t(lang, 'canChiMonth')}</span><span className="v">{canChiName(lang, monthChi.can, monthChi.chi)}{leapMonthTxt}</span></div>
        <div className="row"><span className="k">{t(lang, 'canChiYear')}</span><span className="v">{canChiName(lang, yearChi.can, yearChi.chi)}</span></div>
        <div className="row"><span className="k">{t(lang, 'solarTerm')}</span><span className="v">{TERMS[lang][selTerm]}</span></div>
        <div className="row">
          <span className="k">{t(lang, 'hoangDao')}</span>
          <span className={`v ${selGod.hoang ? 'good' : 'bad'}`}>{GOD_NAMES[lang][selGod.god]} · {goodLabel(selGod.hoang, lang)}</span>
        </div>
        {holidayNames.length ? (
          <div className="row"><span className="k">{t(lang, 'holidays')}</span><span className="v">{holidayNames.join(' · ')}</span></div>
        ) : null}
        {selSchedules.length ? (
          <div className="row">
            <span className="k">{t(lang, 'schedules')}</span>
            <span className="v sched-v">
              {selSchedules.map((s) => (
                <span key={s.title} className="sched-item">
                  <span className="sched-type">{EVENT_TYPES[lang][s.type] ?? EVENT_TYPES[lang].custom}</span>{' '}
                  {s.title}
                  {s.note ? <span className="sched-note"> {s.note}</span> : null}
                </span>
              ))}
            </span>
          </div>
        ) : null}
      </div>
      <div className="detail-hours">
        <div className="hours-title">{t(lang, 'goodHours')} ({goodHours.length}/12)</div>
        <div className="hours-list">{goodHours.map((hh) => <span key={hh} className="chip">{hh}</span>)}</div>
      </div>
      <p className="note">{t(lang, 'horoscopeNote')}</p>
    </div>
  );
}
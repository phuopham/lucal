import React from 'react';
import { type Lang, WEEKDAYS, TERMS, HOLIDAYS, LUNAR_MONTHS, t } from '../lib/i18n';
import { getWeekday } from '../lib/lunar';
import { fmtSolar, lunarDayName, pad } from '../lib/format';
import type { DayInfo } from '../lib/dayinfo';

export function lunarPrimaryLabel(day: number): string {
  return String(day);
}

export default function LunarDayCell({
  info,
  selected,
  lang,
  onSelect,
}: {
  info: DayInfo;
  selected: Date;
  lang: Lang;
  onSelect: (d: Date) => void;
}) {
  const isSel =
    selected.getFullYear() === info.y && selected.getMonth() + 1 === info.m && selected.getDate() === info.d;
  const cls = ['day-cell lcell', info.isToday ? 'today' : '', isSel ? 'sel' : '', info.god.hoang ? 'hoang' : 'hac']
    .filter(Boolean)
    .join(' ');

  const chip: string[] = [];
  if (info.holiday) chip.push(HOLIDAYS[lang][info.holiday.id]);
  if (info.newYearEve) chip.push(lang === 'vi' ? 'Giao thừa' : 'NYE');
  if (chip.length > 1) chip.length = 1;

  const leapTxt = info.lunar.leap ? ` ${t(lang, 'leapShort')}` : '';
  const titleParts = [
    WEEKDAYS[lang][getWeekday(info.jd)],
    fmtSolar(lang, info.d, info.m, info.y),
    `${lunarDayName(lang, info.lunar.day)} tháng ${LUNAR_MONTHS[lang][info.lunar.month]}${leapTxt}`,
    TERMS[lang][info.term],
    ...info.schedules.map((s) => s.title),
  ];

  return (
    <button
      type="button"
      className={cls}
      data-jd={info.jd}
      title={titleParts.join(' · ')}
      aria-label={`${info.lunar.day}/${info.lunar.month} · ${fmtSolar(lang, info.d, info.m, info.y)}`}
      onClick={() => onSelect(new Date(info.y, info.m - 1, info.d))}
    >
      <span className={`lcell-lunar${info.lunar.day === 15 ? ' full' : ''}`}>{lunarPrimaryLabel(info.lunar.day)}</span>
      <span className="lcell-solar">
        {pad(info.d)}/{pad(info.m)}
      </span>
      {info.schedules.length ? (
        <span className="evdots">
          {Array.from({ length: Math.min(info.schedules.length, 3) }).map((_, i) => (
            <i key={i} className="dot" />
          ))}
        </span>
      ) : null}
      {chip.length ? <span className="event">{chip[0]}</span> : info.termStart ? <span className="event term">{TERMS[lang][info.term]}</span> : null}
    </button>
  );
}
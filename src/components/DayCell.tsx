import React from 'react';
import { type Lang, WEEKDAYS, TERMS, HOLIDAYS, LUNAR_MONTHS, t, formatLunar } from '../lib/i18n';
import { getWeekday } from '../lib/lunar';
import { fmtSolar, lunarDayName } from '../lib/format';
import type { DayInfo } from '../lib/dayinfo';

export default function DayCell({
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
  const cls = ['day-cell', info.isToday ? 'today' : '', isSel ? 'sel' : '', info.god.hoang ? 'hoang' : 'hac']
    .filter(Boolean)
    .join(' ');
  const lunLabel =
    info.lunar.day === 1
      ? `${info.lunar.leap ? `${t(lang, 'leapShort')} ` : ''}${formatLunar(info.lunar.day, info.lunar.month)}`
      : info.lunar.day === 15
        ? lang === 'vi'
          ? 'Rằm'
          : 'Full'
        : String(info.lunar.day);
  const chip: string[] = [];
  if (info.holiday) chip.push(HOLIDAYS[lang][info.holiday.id]);
  if (info.newYearEve) chip.push(lang === 'vi' ? 'Giao thừa' : 'NYE');
  if (chip.length > 1) chip.length = 1;
  const titleParts = [
    WEEKDAYS[lang][getWeekday(info.jd)],
    fmtSolar(lang, info.d, info.m, info.y),
    `${lunarDayName(lang, info.lunar.day)} tháng ${LUNAR_MONTHS[lang][info.lunar.month]}${info.lunar.leap ? ' N' : ''}`,
    TERMS[lang][info.term],
    ...info.schedules.map((s) => s.title),
  ];

  return (
    <button
      type="button"
      className={cls}
      data-jd={info.jd}
      title={titleParts.join(' · ')}
      aria-label={`${info.d} · ${fmtSolar(lang, info.d, info.m, info.y)}`}
      onClick={() => onSelect(new Date(info.y, info.m - 1, info.d))}
    >
      <span className="sol">{info.d}</span>
      <span className="lun">{lunLabel}</span>
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
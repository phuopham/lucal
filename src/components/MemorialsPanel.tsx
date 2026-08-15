import React from 'react';
import { type Lang, MONTHS_SHORT, t } from '../lib/i18n';
import { memorialDays } from '../lib/memorials';
import { fmtSolar, pad } from '../lib/format';
import type { ScheduleEntry } from '../lib/schedule';

export default function MemorialsPanel({
  schedules,
  year,
  month,
  lang,
}: {
  schedules: ScheduleEntry[];
  year: number;
  month: number;
  lang: Lang;
}) {
  const days = memorialDays(schedules, year);
  const groups: { month: number; items: { d: number; m: number; y: number; title: string }[] }[] = [];
  for (const day of days) {
    let g = groups[groups.length - 1];
    if (!g || g.month !== day.m) {
      g = { month: day.m, items: [] };
      groups.push(g);
    }
    g.items.push(day);
  }

  return (
    <aside className="memorials-col">
      <h2 className="memorials-title">{t(lang, 'memorials')}</h2>
      {days.length === 0 ? (
        <p className="muted-note">{t(lang, 'none')}</p>
      ) : (
        groups.map((g) => (
          <div key={g.month} className="m-group" data-month={g.month}>
            <div className="m-head">{lang === 'vi' ? `Tháng ${g.month}` : MONTHS_SHORT[lang][g.month - 1]}</div>
            {g.items.map((day) => (
              <div
                key={`${day.d}-${day.m}`}
                className={`m-item${day.m === month ? ' mem' : ''}`}
                title={`${fmtSolar(lang, day.d, day.m, day.y)} · ${day.title}`}
              >
                <span className="m-date">{pad(day.d)}/{pad(day.m)}</span>
                <span className="m-name">{day.title}</span>
              </div>
            ))}
          </div>
        ))
      )}
    </aside>
  );
}
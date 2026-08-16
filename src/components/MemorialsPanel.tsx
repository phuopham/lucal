import React, { useState } from 'react';
import { type Lang, MONTHS_SHORT, LUNAR_MONTHS, t } from '../lib/i18n';
import { birthdayDays, memorialDays, memorialDaysLunar } from '../lib/memorials';
import { fmtSolar, lunarDayName, pad } from '../lib/format';
import type { ScheduleEntry } from '../lib/schedule';

type Tab = 'memorial' | 'birthday';

interface Item {
  d: number;
  m: number;
  y: number;
  ld?: number;
  lm?: number;
  title: string;
}

function groupsOf(days: Item[], lunar: boolean) {
  const groups: { month: number; items: Item[] }[] = [];
  for (const day of days) {
    const month = lunar ? day.lm ?? day.m : day.m;
    let g = groups[groups.length - 1];
    if (!g || g.month !== month) {
      g = { month, items: [] };
      groups.push(g);
    }
    g.items.push(day);
  }
  return groups;
}

export default function MemorialsPanel({
  schedules,
  year,
  lunar,
  hlMonth,
  lang,
}: {
  schedules: ScheduleEntry[];
  year: number;
  lunar: boolean;
  hlMonth: number;
  lang: Lang;
}) {
  const [tab, setTab] = useState<Tab>('memorial');
  const isLunar = tab === 'memorial' && lunar;
  const days = isLunar ? memorialDaysLunar(schedules, year) : tab === 'memorial' ? memorialDays(schedules, year) : birthdayDays(schedules, year);
  const groups = groupsOf(days, tab === 'memorial' && lunar);
  const inMonth = (day: Item): boolean => (tab === 'memorial' ? day.lm ?? day.m : day.m) === hlMonth;

  const head = (g: number): string => {
    if (tab !== 'memorial') return lang === 'vi' ? `Tháng ${g}` : MONTHS_SHORT[lang][g - 1];
    if (!lunar) return lang === 'vi' ? `Tháng ${g}` : MONTHS_SHORT[lang][g - 1];
    return lang === 'vi' ? `Tháng ${LUNAR_MONTHS[lang][g]}` : LUNAR_MONTHS[lang][g];
  };

  const dateText = (day: Item): string => {
    const lunarMode = tab === 'memorial' && lunar;
    const dd = lunarMode ? day.ld ?? day.d : day.d;
    const mm = lunarMode ? day.lm ?? day.m : day.m;
    return `${pad(dd)}/${pad(mm)}`;
  };

  const tip = (day: Item): string => {
    if (tab !== 'memorial') return `${fmtSolar(lang, day.d, day.m, day.y)} · ${day.title}`;
    const lunarMode = tab === 'memorial' && lunar;
    if (!lunarMode) return `${fmtSolar(lang, day.d, day.m, day.y)} · ${day.title}`;
    return `${lunarDayName(lang, day.ld ?? day.d)} tháng ${LUNAR_MONTHS[lang][day.lm ?? day.m]} · ${day.title}`;
  };

  return (
    <aside className="memorials-col">
      <div className="m-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'memorial'}
          className={`m-tab${tab === 'memorial' ? ' active' : ''}`}
          onClick={() => setTab('memorial')}
        >
          {t(lang, 'memorials')}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'birthday'}
          className={`m-tab${tab === 'birthday' ? ' active' : ''}`}
          onClick={() => setTab('birthday')}
        >
          {t(lang, 'birthdays')}
        </button>
      </div>
      {days.length === 0 ? (
        <p className="muted-note">{t(lang, 'none')}</p>
      ) : (
        groups.map((g) => (
          <div key={g.month} className="m-group" data-month={g.month}>
            <div className="m-head">{head(g.month)}</div>
            {g.items.map((day, i) => (
              <div
                key={`${day.title}-${i}`}
                className={`m-item${inMonth(day) ? ' mem' : ''}`}
                title={tip(day)}
              >
                <span className="m-date">{dateText(day)}</span>
                <span className="m-name">{day.title}</span>
              </div>
            ))}
          </div>
        ))
      )}
    </aside>
  );
}
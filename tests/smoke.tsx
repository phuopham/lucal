import { Window } from 'happy-dom';

const window = new Window();
const { document } = window;
(globalThis as Record<string, unknown>).window = window;
(globalThis as Record<string, unknown>).document = document;
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

import { createRoot } from 'react-dom/client';
import { act as actFn } from 'react';
import Calendar, { dateFromQuery, viewFromQuery } from '../src/components/Calendar';
import { convertSolar2Lunar, jdFromDate, daysInLunarMonth } from '../src/lib/lunar.ts';
import type { ScheduleEntry } from '../src/lib/schedule.ts';

let pass = 0;
let fail = 0;
function ok(cond: boolean, label: string) {
  if (cond) pass++;
  else {
    fail++;
    console.error('  FAIL: ' + label);
  }
}

const empty: ScheduleEntry[] = [];

// --- URL query helpers (client-side fallback for static hosting) ---
{
  const d = dateFromQuery('?date=2026-12-25');
  ok(
    d !== undefined && d.getFullYear() === 2026 && d.getMonth() === 11 && d.getDate() === 25,
    'dateFromQuery parses ISO date',
  );
  ok(dateFromQuery('?date=bogus') === undefined, 'dateFromQuery rejects junk');
  ok(dateFromQuery('') === undefined, 'dateFromQuery rejects empty');
  ok(viewFromQuery('?view=year') === 'year', 'viewFromQuery reads year');
  ok(viewFromQuery('?view=month') === 'month', 'viewFromQuery reads month');
  ok(viewFromQuery('?view=x') === undefined, 'viewFromQuery rejects junk');
}

function renderInto(host: HTMLElement, schedules: ScheduleEntry[] = empty, initialDate?: Date): void {
  const root = createRoot(host);
  actFn(() => {
    root.render(<Calendar schedules={schedules} initialDate={initialDate} />);
  });
}

const host = document.createElement('div');
document.body.appendChild(host);
renderInto(host);

const now = new Date();
const nowD = now.getDate();
const nowM = now.getMonth() + 1;
const nowY = now.getFullYear();

const $ = (sel: string): HTMLElement | null => host.querySelector(sel);
const act = (name: string): void => {
  const el = $(`[data-act="${name}"]`) as HTMLElement;
  flush(() => el?.click());
};
const flush = (fn: () => void): void => {
  actFn(() => fn());
};

ok($('.cal-card') !== null, 'card rendered');
ok(host.querySelectorAll('.day-cell:not(.empty)').length >= 28, 'month grid has cells');
ok($('.detail-big') !== null, 'details rendered');
ok($('.chip') !== null, 'good hours chips rendered');
ok($('.cal-subtitle')!.textContent!.includes('Năm'), 'subtitle shows lunar year');

// Assert the subtitle reflects TODAY's real lunar date (month name + year),
// protecting against argument-order regressions in jd/convert calls.
{
  const l = convertSolar2Lunar(nowD, nowM, nowY);
  const yearVi = `${['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'][(l.year + 6) % 10]} ${['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'][(l.year + 8) % 12]}`;
  const monthVi = ['', 'Giêng', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín', 'Mười', 'Một', 'Chạp'][l.month];
  const sub = $('.cal-subtitle')!.textContent!;
  ok(sub.includes(`tháng ${monthVi}`), `subtitle lunar month "${monthVi}" (got "${sub}")`);
  ok(sub.includes(yearVi), `subtitle lunar year "${yearVi}" (got "${sub}")`);
}

act('view-year');
ok($('.year-grid') !== null, 'year view rendered');
ok(host.querySelectorAll('.ym').length === 12, '12 mini months');

act('view-month');
const firstDay = $('.day-cell:not(.empty)') as HTMLElement;
const jd = Number(firstDay.dataset.jd);
flush(() => firstDay.click());
ok($('.day-cell.sel') !== null, 'selected day highlighted');

act('lang');
ok(host.querySelector('.cal-title')!.textContent!.match(/[A-Za-z]{3}/) !== null, 'language toggle switches to EN');
act('lang');
ok(host.querySelector('.cal-title')!.textContent!.includes('Tháng'), 'language toggle switches back to VI');

flush(() => $('.cal-card')!.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })));
ok($('.day-cell.sel')?.getAttribute('data-jd') === String(jd + 1), 'ArrowRight moves selection to next day');

const titleBefore = host.querySelector('.cal-title')!.textContent!;
act('month-next');
const titleAfter = host.querySelector('.cal-title')!.textContent!;
ok(titleAfter !== titleBefore, 'next-month navigates (' + titleBefore + ' -> ' + titleAfter + ')');

act('today');
ok(host.querySelector('.cal-title')!.textContent!.includes(String(nowY)), 'Today resets to current year');

const l2 = convertSolar2Lunar(nowD, nowM, nowY);
ok(l2.year >= 1900 && l2.year <= 2100, 'today converts to lunar: ' + JSON.stringify(l2));

// --- lunar month view (lunar days primary, solar secondary) ---
act('view-lmonth');
{
  const expect = daysInLunarMonth(l2.month, l2.year, l2.leap);
  const cells = host.querySelectorAll('.day-cell:not(.empty)');
  ok(cells.length === expect, `lunar month grid has ${expect} cells (got ${cells.length})`);
  ok($('.lcell-lunar') !== null, 'lunar primary label rendered');
  ok($('.lcell-solar') !== null, 'solar secondary rendered');
  ok($('.day-cell.today .lcell-lunar') !== null, 'today highlighted in lunar month view');
  ok(host.querySelector('.cal-title')!.textContent!.includes('Năm'), 'lunar month header shows lunar year');
}
const moonTitleBefore = host.querySelector('.cal-title')!.textContent!;
act('month-next');
{
  const moonTitleAfter = host.querySelector('.cal-title')!.textContent!;
  ok(moonTitleAfter !== moonTitleBefore, 'lunar month navigates to next lunar month');
}

// --- lunar year view ---
act('view-lyear');
{
  ok(host.querySelectorAll('.ym').length >= 12, 'lunar year has >=12 month tiles');
  ok($('.lyc') !== null, 'lunar mini day cells rendered');
  const tile = host.querySelector('.ym .lyc') as HTMLElement | null;
  flush(() => tile?.click());
  ok($('.lcell-lunar') !== null, 'clicking a mini month opens the lunar month grid');
}

// --- URL sync for lunar views ---
{
  flush(() => {
    const params = new URLSearchParams();
    params.set('date', `${nowY}-${String(nowM).padStart(2, '0')}-${String(nowD).padStart(2, '0')}`);
    params.set('view', 'lyear');
    window.history.replaceState({}, '', `?${params.toString()}`);
  });
  ok(viewFromQuery('?view=lyear') === 'lyear', 'viewFromQuery reads lyear');
  ok(viewFromQuery('?view=lmonth') === 'lmonth', 'viewFromQuery reads lmonth');
}

// --- schedules passed as props ---
(() => {
  const host2 = document.createElement('div');
  document.body.appendChild(host2);
  renderInto(host2, [
    { title: 'Sinh nhật Mẹ', type: 'birthday', recurrence: 'yearly', date: `${nowY}-${nowM}-${nowD}` },
    { title: 'Lunar event', type: 'custom', recurrence: 'lunar-yearly', lunarMonth: l2.month, lunarDay: l2.day },
  ]);
  const todayCell = host2.querySelector('.day-cell.today') as HTMLElement | null;
  ok(todayCell !== null && todayCell.querySelector('.evdots .dot') !== null, 'day-cell shows schedule dot');
  const rows = [...host2.querySelectorAll('.row')];
  ok(
    rows.some((r) => (r.querySelector('.k') as HTMLElement)?.textContent?.includes('Lịch')),
    'details shows schedule section label',
  );
})();

// --- initialDate prop selects the given day and syncs the URL ---
(() => {
  const initial = new Date(2026, 11, 25); // 25/12/2026, distinct from today
  const host3 = document.createElement('div');
  document.body.appendChild(host3);
  const replaceCalls: string[] = [];
  const origReplace = window.history.replaceState.bind(window.history);
  window.history.replaceState = ((_s: unknown, _t: unknown, url?: string | URL | null) => {
    if (url) replaceCalls.push(String(url));
  }) as typeof window.history.replaceState;
  renderInto(host3, empty, initial);
  const sel = host3.querySelector('.day-cell.sel') as HTMLElement | null;
  const expectedInitial = `?date=2026-12-25`;
  ok(sel !== null && sel.dataset.jd === String(jdFromDate(25, 12, 2026)), 'initialDate selects the given day');
  ok(replaceCalls.some((u) => u.endsWith(expectedInitial)), 'URL reflects initial date (' + replaceCalls.join(', ') + ')');

  const nextBtn = host3.querySelector('[data-act="month-next"]') as HTMLElement;
  flush(() => nextBtn.click());
  flush(() => nextBtn.click());
  const expectedNext = `?date=2027-02-25`;
  ok(replaceCalls.some((u) => u.endsWith(expectedNext)), 'URL advances after navigation (' + replaceCalls.join(', ') + ')');
  window.history.replaceState = origReplace;
})();

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
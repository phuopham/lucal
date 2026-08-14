import {
  convertSolar2Lunar,
  jdFromDate,
  jdToDate,
  getDayCanChi,
  getYearCanChi,
  getLunarMonthCanChi,
  getWeekday,
  getSolarTermIndex,
  getDayGod,
  isHoangDaoHour,
  getHoliday,
  isLastDayOfLunarYear,
  type LunarDate,
} from '../lib/lunar';
import { schedulesOnDay, type ScheduleEntry } from '../lib/schedule';
import {
  type Lang,
  WEEKDAYS,
  WEEKDAYS_SHORT,
  MONTHS,
  MONTHS_SHORT,
  LUNAR_MONTHS,
  TERMS,
  GOD_NAMES,
  HOLIDAYS,
  CHI,
  canChiName,
  lunarMonthName,
  t,
  formatLunar,
} from '../lib/i18n';

interface State {
  year: number;
  month: number; // 1-12
  selected: Date;
  view: 'month' | 'year';
  lang: Lang;
}

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);
}

function lunarDayName(lang: Lang, day: number): string {
  return lang === 'vi' ? (day <= 10 ? `Mùng ${day}` : `Ngày ${day}`) : `Day ${day}`;
}

function fmtSolar(lang: Lang, d: number, m: number, y: number): string {
  return lang === 'vi' ? `${d}/${m}/${y}` : `${MONTHS_SHORT[lang][m - 1]} ${d}, ${y}`;
}

interface DayInfo {
  jd: number;
  d: number;
  m: number;
  y: number;
  lunar: LunarDate;
  dayChi: { can: number; chi: number };
  term: number;
  termStart: boolean;
  god: { god: number; hoang: boolean };
  holiday: ReturnType<typeof getHoliday>;
  newYearEve: boolean;
  isToday: boolean;
  schedules: ScheduleEntry[];
}

function daysInSolarMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function monthDays(year: number, month: number, schedules: ScheduleEntry[]): DayInfo[] {
  const days: DayInfo[] = [];
  const count = daysInSolarMonth(year, month);
  const today = new Date();
  const todayJd = jdFromDate(today.getDate(), today.getMonth() + 1, today.getFullYear());
  for (let d = 1; d <= count; d++) {
    const jd = jdFromDate(d, month, year);
    const lunar = convertSolar2Lunar(d, month, year);
    const dayChi = getDayCanChi(jd);
    const term = getSolarTermIndex(jd);
    const termStart = getSolarTermIndex(jd - 1) !== term;
    const god = getDayGod(lunar.day, dayChi.chi);
    const holiday = getHoliday(lunar);
    days.push({
      jd,
      d,
      m: month,
      y: year,
      lunar,
      dayChi,
      term,
      termStart,
      god,
      holiday,
      newYearEve: isLastDayOfLunarYear(lunar),
      isToday: jd === todayJd,
      schedules: schedulesOnDay(schedules, { d, m: month, y: year, ld: lunar.day, lm: lunar.month }),
    });
  }
  return days;
}

function pad(n: number): string {
  return n < 10 ? '0' + n : String(n);
}

function hourRange(h: number): string {
  return `${pad(h)}–${pad((h + 2) % 24)}`;
}

function good(badDiv: boolean, lang: Lang): string {
  return badDiv ? t(lang, 'good') : t(lang, 'bad');
}

export function mountCalendar(host: HTMLElement): void {
  const today = new Date();
  const state: State = {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    selected: today,
    view: 'month',
    lang: 'vi',
  };

  let schedules: ScheduleEntry[] = [];
  try {
    const raw = host.dataset.schedules;
    if (raw) {
      schedules = JSON.parse(raw) as ScheduleEntry[];
    }
  } catch {
    schedules = [];
  }

  function render(): void {
    const lang = state.lang;
    const sel = state.selected;
    const selLunar = convertSolar2Lunar(sel.getDate(), sel.getMonth() + 1, sel.getFullYear());
    const selJd = jdFromDate(sel.getDate(), sel.getMonth() + 1, sel.getFullYear());
    const selWeek = getWeekday(selJd);
    const selChi = getDayCanChi(selJd);
    const yearChi = getYearCanChi(selLunar.year);
    const monthChi = getLunarMonthCanChi(selLunar.year, selLunar.month);
    const selTerm = getSolarTermIndex(selJd);
    const selGod = getDayGod(selLunar.day, selChi.chi);

    const title =
      state.view === 'month'
        ? lang === 'vi'
          ? `${MONTHS[lang][state.month - 1]} năm ${state.year}`
          : `${MONTHS[lang][state.month - 1]} ${state.year}`
        : lang === 'vi'
          ? `Năm ${state.year}`
          : `Year ${state.year}`;

    const leapTxt = selLunar.leap ? ` ${t(lang, 'leapShort')}` : '';
    const subtitle =
      lang === 'vi'
        ? `Âm lịch: tháng ${LUNAR_MONTHS[lang][selLunar.month]}${leapTxt} · ${lunarDayName(lang, selLunar.day)} · Năm ${canChiName(lang, yearChi.can, yearChi.chi)}`
        : `Lunar: ${lunarMonthName(lang, selLunar.month, selLunar.leap)} lunar month · ${lunarDayName(lang, selLunar.day)} · ${canChiName(lang, yearChi.can, yearChi.chi)} year`;

    // ---- controls ----
    const yMin = today.getFullYear() - 200;
    const yMax = today.getFullYear() + 30;
    let yOpts = '';
    for (let y = yMax; y >= yMin; y--) {
      yOpts += `<option value="${y}"${y === state.year ? ' selected' : ''}>${y}</option>`;
    }
    let mOpts = '';
    for (let m = 1; m <= 12; m++) {
      mOpts += `<option value="${m}"${m === state.month ? ' selected' : ''}>${MONTHS[lang][m - 1]}</option>`;
    }

    const controls = `
      <div class="controls">
        <div class="nav-group">
          <button type="button" class="btn" data-act="year-prev" title="${esc(t(lang, 'prevYear'))}">«</button>
          <button type="button" class="btn" data-act="month-prev" title="${esc(t(lang, 'prevMonth'))}">‹</button>
          <select class="sel sel-month" data-act="month-select" aria-label="${esc(t(lang, 'month'))}">${mOpts}</select>
          <select class="sel sel-year" data-act="year-select" aria-label="${esc(t(lang, 'lunarYear'))}">${yOpts}</select>
          <button type="button" class="btn" data-act="month-next" title="${esc(t(lang, 'nextMonth'))}">›</button>
          <button type="button" class="btn" data-act="year-next" title="${esc(t(lang, 'nextYear'))}">»</button>
        </div>
        <div class="nav-group">
          <button type="button" class="btn today-btn" data-act="today" title="${esc(t(lang, 'backToday'))}">${esc(t(lang, 'today'))}</button>
          <div class="seg" role="tablist">
            <button type="button" class="seg-btn${state.view === 'month' ? ' on' : ''}" data-act="view-month">${esc(t(lang, 'monthView'))}</button>
            <button type="button" class="seg-btn${state.view === 'year' ? ' on' : ''}" data-act="view-year">${esc(t(lang, 'yearView'))}</button>
          </div>
          <button type="button" class="btn lang-btn" data-act="lang" title="${esc(t(lang, 'langTitle'))}">${esc(t(lang, 'langName'))}</button>
        </div>
      </div>`;

    // ---- grid ----
    let grid: string;

    if (state.view === 'month') {
      const info = monthDays(state.year, state.month, schedules);
      const offset = (new Date(state.year, state.month - 1, 1).getDay() + 6) % 7;
      const cells: string[] = [];
      for (let i = 0; i < offset; i++) {
        cells.push('<div class="day-cell empty"></div>');
      }
      for (const d of info) {
        cells.push(dayCell(d, state));
      }
      const gridRow = Math.ceil((offset + info.length) / 7);
      for (let i = cells.length; i < gridRow * 7; i++) {
        cells.push('<div class="day-cell empty"></div>');
      }
      const weekHeader = WEEKDAYS_SHORT[lang].map((w) => `<div class="wd">${w}</div>`).join('');
      grid = `<div class="week-row">${weekHeader}</div><div class="grid">${cells.join('')}</div>`;
    } else {
      const monthsHtml: string[] = [];
      for (let m = 1; m <= 12; m++) {
        const info = monthDays(state.year, m, schedules);
        const offset = (new Date(state.year, m - 1, 1).getDay() + 6) % 7;
        const cells: string[] = [];
        for (let i = 0; i < offset; i++) cells.push('<span class="yc empty"></span>');
        for (const d of info) {
          const selThis =
            state.selected.getFullYear() === d.y && state.selected.getMonth() + 1 === d.m && state.selected.getDate() === d.d;
          const cls = ['yc', d.isToday ? 'today' : '', selThis ? 'sel' : '', d.god.hoang ? 'hoang' : '']
            .filter(Boolean)
            .join(' ');
          const lun =
            d.lunar.day === 1
              ? `${d.lunar.leap ? `${t(lang, 'leapShort')} ` : ''}${formatLunar(d.lunar.day, d.lunar.month)}`
              : String(d.lunar.day);
          const tip = `${WEEKDAYS[lang][getWeekday(d.jd)]} · ${fmtSolar(lang, d.d, m, state.year)} · ${lunarDayName(lang, d.lunar.day)} tháng ${LUNAR_MONTHS[lang][d.lunar.month]}${d.lunar.leap ? ' N' : ''}${d.schedules.length ? ` · ${d.schedules.map((s) => s.title).join(', ')}` : ''}`;
          cells.push(
            `<button type="button" class="${cls}" data-jd="${d.jd}" title="${esc(tip)}" aria-label="${d.d}">` +
              `<span class="ys">${d.d}${d.schedules.length ? '<i class="dot"></i>' : ''}</span><span class="yl">${lun}</span></button>`,
          );
        }
        const active = state.month === m ? ' active' : '';
        const mTitle: string = lang === 'vi' ? `Tháng ${m}` : MONTHS_SHORT[lang][m - 1];
        monthsHtml.push(
          `<div class="ym${active}" data-ym="${m}" data-year="${state.year}"><div class="ym-title">${mTitle}</div><div class="ym-grid">${cells.join('')}</div></div>`,
        );
      }
      grid = `<div class="year-grid">${monthsHtml.join('')}</div>`;
    }

    // ---- details ----
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

    const leapMonthTxt = selLunar.leap ? ` (${t(lang, 'leap')})` : '';
    const selSchedules = schedulesOnDay(schedules, {
      d: sel.getDate(),
      m: sel.getMonth() + 1,
      y: sel.getFullYear(),
      ld: selLunar.day,
      lm: selLunar.month,
    });
    const details = `
      <div class="details">
        <div class="detail-main">
          <div class="detail-big">${fmtSolar(lang, sel.getDate(), sel.getMonth() + 1, sel.getFullYear())}</div>
          <div class="detail-lunar">${lunarDayName(lang, selLunar.day)} tháng ${LUNAR_MONTHS[lang][selLunar.month]}${leapTxt}, Năm ${canChiName(lang, yearChi.can, yearChi.chi)} · ${WEEKDAYS[lang][selWeek]}</div>
        </div>
        <div class="detail-rows">
          <div class="row"><span class="k">${esc(t(lang, 'canChiDay'))}</span><span class="v">${canChiName(lang, selChi.can, selChi.chi)}</span></div>
          <div class="row"><span class="k">${esc(t(lang, 'canChiMonth'))}</span><span class="v">${canChiName(lang, monthChi.can, monthChi.chi)}${leapMonthTxt}</span></div>
          <div class="row"><span class="k">${esc(t(lang, 'canChiYear'))}</span><span class="v">${canChiName(lang, yearChi.can, yearChi.chi)}</span></div>
          <div class="row"><span class="k">${esc(t(lang, 'solarTerm'))}</span><span class="v">${TERMS[lang][selTerm]}</span></div>
          <div class="row">
            <span class="k">${esc(t(lang, 'hoangDao'))}</span>
            <span class="v ${selGod.hoang ? 'good' : 'bad'}">${GOD_NAMES[lang][selGod.god]} · ${good(selGod.hoang, lang)}</span>
          </div>
          ${
            holidayNames.length
              ? `<div class="row"><span class="k">${esc(t(lang, 'holidays'))}</span><span class="v">${holidayNames.map(esc).join(' · ')}</span></div>`
              : ''
          }
          ${
            selSchedules.length
              ? `<div class="row"><span class="k">${esc(t(lang, 'schedules'))}</span><span class="v sched-v">${selSchedules
                  .map((s) => `${esc(s.title)}${s.note ? ` <span class="sched-note">${esc(s.note)}</span>` : ''}`)
                  .join('<br>')}</span></div>`
              : ''
          }
        </div>
        <div class="detail-hours">
          <div class="hours-title">${esc(t(lang, 'goodHours'))} (${goodHours.length}/12)</div>
          <div class="hours-list">${goodHours.map((hh) => `<span class="chip">${hh}</span>`).join('')}</div>
        </div>
        <p class="note">${esc(t(lang, 'horoscopeNote'))}</p>
      </div>`;

    host.innerHTML = `
      <div class="cal-card" tabindex="0" role="application" aria-label="Lunar calendar">
        <header class="cal-header">
          <h1 class="cal-title">${esc(title)}</h1>
          <div class="cal-subtitle">${esc(subtitle)}</div>
        </header>
        ${controls}
        <div class="cal-body">${grid}</div>
        ${details}
        <footer class="cal-footer">${esc(t(lang, 'keyboardHint'))}</footer>
      </div>`;
  }

  function shiftDay(n: number): void {
    const s = new Date(state.selected);
    s.setDate(s.getDate() + n);
    state.selected = s;
    state.year = s.getFullYear();
    state.month = s.getMonth() + 1;
  }

  function shiftMonth(n: number): void {
    const s = new Date(state.selected);
    s.setMonth(s.getMonth() + n);
    const max = daysInSolarMonth(s.getFullYear(), s.getMonth() + 1);
    if (s.getDate() > max) s.setDate(max);
    state.selected = s;
    state.year = s.getFullYear();
    state.month = s.getMonth() + 1;
    state.view = 'month';
  }

  function shiftYear(n: number): void {
    const s = new Date(state.selected);
    s.setFullYear(Math.max(1400, Math.min(3000, s.getFullYear() + n)));
    const max = daysInSolarMonth(s.getFullYear(), s.getMonth() + 1);
    if (s.getDate() > max) s.setDate(max);
    state.selected = s;
    state.year = s.getFullYear();
  }

  function goTo(y: number, m: number): void {
    const s = state.selected;
    const max = daysInSolarMonth(y, m);
    state.selected = new Date(y, m - 1, Math.min(s.getDate(), max));
    state.year = y;
    state.month = m;
    state.view = 'month';
  }

  function goToday(): void {
    const t0 = new Date();
    state.selected = t0;
    state.year = t0.getFullYear();
    state.month = t0.getMonth() + 1;
    state.view = 'month';
  }

  function dayCell(d: DayInfo, st: State): string {
    const lang = st.lang;
    const isSel =
      st.selected.getFullYear() === d.y && st.selected.getMonth() + 1 === d.m && st.selected.getDate() === d.d;
    const cls = ['day-cell', d.isToday ? 'today' : '', isSel ? 'sel' : '', d.god.hoang ? 'hoang' : 'hac']
      .filter(Boolean)
      .join(' ');
    const lunLabel: string =
      d.lunar.day === 1
        ? `${d.lunar.leap ? `${t(lang, 'leapShort')} ` : ''}${formatLunar(d.lunar.day, d.lunar.month)}`
        : d.lunar.day === 15
          ? lang === 'vi'
            ? 'Rằm'
            : 'Full'
          : String(d.lunar.day);
    const chip: string[] = [];
    if (d.holiday) chip.push(HOLIDAYS[lang][d.holiday.id]);
    if (d.newYearEve) chip.push(lang === 'vi' ? 'Giao thừa' : 'NYE');
    if (chip.length > 1) chip.length = 1;
    const eventLine = chip.length
      ? `<span class="event">${esc(chip[0])}</span>`
      : d.termStart
        ? `<span class="event term">${esc(TERMS[lang][d.term])}</span>`
        : '';
    const scheduleDots = d.schedules.length
      ? `<span class="evdots">${'<i class="dot"></i>'.repeat(Math.min(d.schedules.length, 3))}</span>`
      : '';
    const titleParts = [
      WEEKDAYS[lang][getWeekday(d.jd)],
      fmtSolar(lang, d.d, d.m, d.y),
      `${lunarDayName(lang, d.lunar.day)} tháng ${LUNAR_MONTHS[lang][d.lunar.month]}${d.lunar.leap ? ' N' : ''}`,
      TERMS[lang][d.term],
      ...d.schedules.map((s) => s.title),
    ];
    return `<button type="button" class="${cls}" data-jd="${d.jd}" title="${esc(titleParts.join(' · '))}" aria-label="${d.d} · ${esc(fmtSolar(lang, d.d, d.m, d.y))}">
      <span class="sol">${d.d}</span>
      <span class="lun">${lunLabel}</span>
      ${scheduleDots}
      ${eventLine}
    </button>`;
  }

  // ---- events ----
  host.addEventListener('click', (ev) => {
    const target = ev.target as HTMLElement;
    const cell = target.closest('[data-jd]') as HTMLElement | null;
    if (cell) {
      const jd = Number(cell.dataset.jd);
      const [d, m, y] = jdToDate(jd);
      state.selected = new Date(y, m - 1, d);
      if (state.view === 'year') {
        state.month = m;
        state.view = 'month';
      }
      render();
      return;
    }
    const ym = target.closest('[data-ym]') as HTMLElement | null;
    if (ym) {
      goTo(Number(ym.dataset.year), Number(ym.dataset.ym));
      render();
      return;
    }
    const actEl = target.closest('[data-act]') as HTMLElement | null;
    if (!actEl) return;
    const act = actEl.dataset.act;
    switch (act) {
      case 'month-prev':
        shiftMonth(-1);
        break;
      case 'month-next':
        shiftMonth(1);
        break;
      case 'year-prev':
        shiftYear(-1);
        break;
      case 'year-next':
        shiftYear(1);
        break;
      case 'today':
        goToday();
        break;
      case 'view-month':
        state.view = 'month';
        break;
      case 'view-year':
        state.view = 'year';
        break;
      case 'lang':
        state.lang = state.lang === 'vi' ? 'en' : 'vi';
        break;
    }
    render();
  });

  host.addEventListener('change', (ev) => {
    const tgt = ev.target as HTMLSelectElement;
    if (tgt.dataset.act === 'month-select') {
      goTo(state.year, Number(tgt.value));
    } else if (tgt.dataset.act === 'year-select') {
      goTo(Number(tgt.value), state.month);
    } else {
      return;
    }
    render();
  });

  host.addEventListener('keydown', (ev) => {
    let handled = true;
    if (state.view === 'month') {
      switch (ev.key) {
        case 'ArrowLeft': shiftDay(-1); break;
        case 'ArrowRight': shiftDay(1); break;
        case 'ArrowUp': shiftDay(-7); break;
        case 'ArrowDown': shiftDay(7); break;
        case 'PageUp': shiftMonth(-1); break;
        case 'PageDown': shiftMonth(1); break;
        case 'Home': shiftYear(-1); break;
        case 'End': shiftYear(1); break;
        default: handled = false;
      }
    } else {
      switch (ev.key) {
        case 'ArrowLeft': shiftYear(-1); break;
        case 'ArrowRight': shiftYear(1); break;
        case 'PageUp': shiftYear(-1); break;
        case 'PageDown': shiftYear(1); break;
        default: handled = false;
      }
    }
    if (handled) {
      ev.preventDefault();
      render();
    }
  });

  let touchX = 0;
  host.addEventListener('touchstart', (ev) => {
    touchX = ev.touches[0].clientX;
  });
  host.addEventListener('touchend', (ev) => {
    const dx = ev.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 60) {
      shiftMonth(dx < 0 ? 1 : -1);
      render();
    }
  });

  render();
}
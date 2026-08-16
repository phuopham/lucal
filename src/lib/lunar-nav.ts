import { lunarMonthSequence } from './dayinfo';

export interface LunarMonthPos {
  year: number;
  month: number;
  leap: boolean;
}

/** Whether a lunar (year, month, leap) combo actually exists. */
export function lunarMonthExists(y: number, m: number, leap: boolean): boolean {
  return lunarMonthSequence(y).some((x) => x.month === m && x.leap === leap);
}

/** Index of (m, leap) within the lunar year's ordered month sequence, or -1. */
function seqIndex(seq: { month: number; leap: boolean }[], m: number, leap: boolean): number {
  return seq.findIndex((x) => x.month === m && x.leap === leap);
}

/** Next lunar month, walking through leap months. */
export function nextLunarMonth(y: number, m: number, leap: boolean): LunarMonthPos {
  const seq = lunarMonthSequence(y);
  const i = seqIndex(seq, m, leap);
  if (i >= 0 && i + 1 < seq.length) {
    const n = seq[i + 1];
    return { year: y, month: n.month, leap: n.leap };
  }
  return { year: y + 1, month: 1, leap: false };
}

/** Previous lunar month, walking through leap months. */
export function prevLunarMonth(y: number, m: number, leap: boolean): LunarMonthPos {
  const seq = lunarMonthSequence(y);
  const i = seqIndex(seq, m, leap);
  if (i > 0) {
    const p = seq[i - 1];
    return { year: y, month: p.month, leap: p.leap };
  }
  const prevSeq = lunarMonthSequence(y - 1);
  const p = prevSeq[prevSeq.length - 1];
  return { year: y - 1, month: p.month, leap: p.leap };
}

/** Keep a lunar-month position valid for its year (drops a non-existent leap flag). */
export function clampLunarMonth(y: number, m: number, leap: boolean): LunarMonthPos {
  if (leap && !lunarMonthExists(y, m, true)) {
    return { year: y, month: m, leap: false };
  }
  return { year: y, month: m, leap };
}
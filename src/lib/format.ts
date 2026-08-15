import { MONTHS_SHORT, t, type Lang } from './i18n';

export function pad(n: number): string {
  return n < 10 ? '0' + n : String(n);
}

export function lunarDayName(lang: Lang, day: number): string {
  return lang === 'vi' ? (day <= 10 ? `Mùng ${day}` : `Ngày ${day}`) : `Day ${day}`;
}

export function fmtSolar(lang: Lang, d: number, m: number, y: number): string {
  return lang === 'vi' ? `${d}/${m}/${y}` : `${MONTHS_SHORT[lang][m - 1]} ${d}, ${y}`;
}

export function hourRange(h: number): string {
  return `${pad(h)}–${pad((h + 2) % 24)}`;
}

export function goodLabel(hoang: boolean, lang: Lang): string {
  return hoang ? t(lang, 'good') : t(lang, 'bad');
}
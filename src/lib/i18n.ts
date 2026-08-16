export type Lang = 'vi' | 'en';

// Can / Chi and weekday names per language.
export const CAN: Record<Lang, string[]> = {
  vi: ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'],
  en: ['Giap', 'At', 'Binh', 'Dinh', 'Mau', 'Ky', 'Canh', 'Tan', 'Nham', 'Quy'],
};

export const CHI: Record<Lang, string[]> = {
  vi: ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'],
  en: ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'],
};

export const WEEKDAYS: Record<Lang, string[]> = {
  vi: ['Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy', 'Chủ nhật'],
  en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
};

export const WEEKDAYS_SHORT: Record<Lang, string[]> = {
  vi: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};

export const MONTHS: Record<Lang, string[]> = {
  vi: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

export const MONTHS_SHORT: Record<Lang, string[]> = {
  vi: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

// Lunar month ordinal names. Index 1 = Giêng ... 12 = Chạp.
export const LUNAR_MONTHS: Record<Lang, string[]> = {
  vi: ['', 'Giêng', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy', 'Tám', 'Chín', 'Mười', 'Một', 'Chạp'],
  en: ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'],
};

// 24 solar terms (Việt Nam). Index aligned with getSolarTermIndex().
export const TERMS: Record<Lang, string[]> = {
  vi: [
    'Lập xuân', 'Vũ thủy', 'Kinh trập', 'Xuân phân', 'Thanh minh', 'Cốc vũ',
    'Lập hạ', 'Tiểu mãn', 'Mang chủng', 'Hạ chí', 'Tiểu thử', 'Đại thử',
    'Lập thu', 'Xử thử', 'Bạch lộ', 'Thu phân', 'Hàn lộ', 'Sương giáng',
    'Lập đông', 'Tiểu tuyết', 'Đại tuyết', 'Đông chí', 'Tiểu hàn', 'Đại hàn',
  ],
  en: [
    'Start of Spring', 'Rain Water', 'Awakening of Insects', 'Spring Equinox', 'Clear and Bright', 'Grain Rain',
    'Start of Summer', 'Grain Full', 'Grain in Ear', 'Summer Solstice', 'Minor Heat', 'Major Heat',
    'Start of Autumn', 'End of Heat', 'White Dew', 'Autumn Equinox', 'Cold Dew', 'Frost Descent',
    'Start of Winter', 'Minor Snow', 'Major Snow', 'Winter Solstice', 'Minor Cold', 'Major Cold',
  ],
};

// The 12 day-guard gods (index aligned with getDayGod().god).
export const GOD_NAMES: Record<Lang, string[]> = {
  vi: ['Thanh Long', 'Minh Đường', 'Thiên Hình', 'Chu Tước', 'Kim Quỹ', 'Kim Đường', 'Bạch Hổ', 'Ngọc Đường', 'Thiên Lao', 'Nguyên Vũ', 'Tư Mệnh', 'Câu Trần'],
  en: ['Azure Dragon', 'Bright Hall', 'Heavenly Punishment', 'Vermilion Bird', 'Golden Interior', 'Golden Hall', 'White Tiger', 'Jade Hall', 'Heavenly Prison', 'Dark Warrior', 'Fate Official', 'Earth Coffin'],
};

// Holiday names keyed by the id used in LUNAR_HOLIDAYS.
export const HOLIDAYS: Record<Lang, Record<string, string>> = {
  vi: {
    h1_1: 'Tết Nguyên Đán',
    h1_15: 'Tết Nguyên Tiêu',
    h3_3: 'Tết Hàn Thực',
    h3_10: 'Giỗ Tổ Hùng Vương',
    h4_15: 'Lễ Phật Đản',
    h5_5: 'Tết Đoan Ngọ',
    h7_15: 'Lễ Vu Lan',
    h8_15: 'Tết Trung Thu',
    h9_9: 'Tết Trùng Cửu',
    h12_23: 'Ông Công Ông Táo',
  },
  en: {
    h1_1: 'Lunar New Year',
    h1_15: 'Lantern Festival',
    h3_3: 'Cold Food Festival',
    h3_10: 'Hung Kings Festival',
    h4_15: 'Buddha Birthday',
    h5_5: 'Dragon Boat Festival',
    h7_15: 'Ghost Festival',
    h8_15: 'Mid-Autumn Festival',
    h9_9: 'Double Ninth Festival',
    h12_23: 'Kitchen Gods Day',
  },
};

// Event type labels for schedule entries.
export const EVENT_TYPES: Record<Lang, Record<string, string>> = {
  vi: { memorial: 'Giỗ', birthday: 'Sinh nhật', wedding: 'Đám cưới', custom: 'Khác' },
  en: { memorial: 'Memorial', birthday: 'Birthday', wedding: 'Wedding', custom: 'Other' },
};

// Bundled UI strings.
type Bundle = Record<string, string>;

function bundle(vi: Record<string, string>, en: Record<string, string>): Record<Lang, Bundle> {
  return { vi, en };
}

export const UI: Record<Lang, Bundle> = bundle(
  {
    today: 'Hôm nay',
    monthView: 'Tháng',
    yearView: 'Năm',
    lunarMonthView: 'Âm tháng',
    lunarYearView: 'Âm năm',
    lunarYearLabel: 'Năm âm',
    lunarYear: 'Năm',
    month: 'Tháng',
    day: 'Ngày',
    solarDate: 'Dương lịch',
    lunarDate: 'Âm lịch',
    weekday: 'Thứ',
    canChiDay: 'Can Chi ngày',
    canChiMonth: 'Can Chi tháng âm',
    canChiYear: 'Can Chi năm',
    solarTerm: 'Tiết khí',
    hoangDao: 'Hoàng Đạo',
    hackDao: 'Hắc Đạo',
    good: 'Tốt',
    bad: 'Xấu',
    god: 'Sao trực',
    goodHours: 'Giờ Hoàng Đạo',
    holidays: 'Ngày lễ',
    fullMoon: 'Rằm (Vọng)',
    newMoon: 'Ngày Sóc (Mùng 1)',
    newYearEve: 'Giao thừa',
    leapShort: 'Nhuận',
    leap: 'Nhuận',
    none: 'Không có',
    prevMonth: 'Tháng trước',
    nextMonth: 'Tháng sau',
    prevYear: 'Năm trước',
    nextYear: 'Năm sau',
    backToday: 'Quay về hôm nay',
    week: 'Tuần',
    selectDay: 'Thông tin ngày',
    schedules: 'Lịch trình',
    eventType: 'Loại sự kiện',
    memorials: 'Giỗ',
    birthdays: 'Sinh nhật',
    horoscopeNote: 'Hoàng Đạo/Hắc Đạo là dân gian, mang tính tham khảo.',
    langName: 'EN',
    langTitle: 'Switch to English',
    keyboardHint: '← →: ngày · ↑ ↓: tuần · PgUp/PgDn: tháng · Home/End: năm',
    hourLabel: 'giờ',
  },
  {
    today: 'Today',
    monthView: 'Month',
    yearView: 'Year',
    lunarMonthView: 'Lunar month',
    lunarYearView: 'Lunar year',
    lunarYearLabel: 'Lunar year',
    lunarYear: 'Year',
    month: 'Month',
    day: 'Day',
    solarDate: 'Solar date',
    lunarDate: 'Lunar date',
    weekday: 'Weekday',
    canChiDay: 'Day Can-Chi',
    canChiMonth: 'Lunar month Can-Chi',
    canChiYear: 'Year Can-Chi',
    solarTerm: 'Solar term',
    hoangDao: 'Auspicious',
    hackDao: 'Inauspicious',
    good: 'Good',
    bad: 'Bad',
    god: 'Guardian',
    goodHours: 'Auspicious hours',
    holidays: 'Holidays',
    fullMoon: 'Full moon',
    newMoon: 'New moon',
    newYearEve: "New Year's Eve",
    leapShort: 'Leap',
    leap: 'Leap',
    none: 'None',
    prevMonth: 'Previous month',
    nextMonth: 'Next month',
    prevYear: 'Previous year',
    nextYear: 'Next year',
    backToday: 'Back to today',
    week: 'Week',
    selectDay: 'Day details',
    schedules: 'Schedules',
    eventType: 'Event type',
    memorials: 'Memorials',
    birthdays: 'Birthdays',
    horoscopeNote: 'Auspicious/inauspicious markers are folk tradition — for reference only.',
    langName: 'VI',
    langTitle: 'Chuyển sang tiếng Việt',
    keyboardHint: '← →: day · ↑ ↓: week · PgUp/PgDn: month · Home/End: year',
    hourLabel: 'h',
  },
);

export function t(lang: Lang, key: string): string {
  return UI[lang][key] ?? key;
}

// Helpers -----------------------------------------------------------------

export function canChiName(lang: Lang, can: number, chi: number): string {
  return `${CAN[lang][can]} ${CHI[lang][chi]}`;
}

export function lunarMonthName(lang: Lang, month: number, leap: boolean): string {
  const short = UI[lang].leapShort;
  return leap ? `${LUNAR_MONTHS[lang][month]} ${short}` : LUNAR_MONTHS[lang][month];
}

export function formatLunar(day: number, month: number): string {
  return `${day}/${month}`;
}
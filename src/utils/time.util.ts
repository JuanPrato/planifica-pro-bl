import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

export const TIME_FORMAT = 'YYYY-DD-MM';

export function fromKey(key: string) {
  return dayjs(key, TIME_FORMAT);
}

export function formatToKey(day: Dayjs) {
  return day.format(TIME_FORMAT);
}

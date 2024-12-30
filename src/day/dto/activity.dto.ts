import type { Dayjs } from 'dayjs';

export class ActivityDto {
  id: number;
  title: string;
  time: number;
  maxTime: boolean;
  primary: boolean;
  completed: boolean;
  timeUsed?: number;
  date: Dayjs;
}

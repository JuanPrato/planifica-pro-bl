import type { Dayjs } from 'dayjs';

export class CreateActivityDto {
  title: string;
  time: number;
  maxTime: boolean;
  primary: boolean;
  completed: boolean;
  date: Dayjs;
}

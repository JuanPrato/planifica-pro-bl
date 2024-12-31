import type { Dayjs } from 'dayjs';

export class UpdateActivityDto {
  id: string;
  completed?: boolean;
  timeUsed?: number;
  date: Dayjs;
}
import { ActivityDto } from './activity.dto';
import { Dayjs } from 'dayjs';

export class DayDto {
  activities: ActivityDto[];
  date: Dayjs;
}

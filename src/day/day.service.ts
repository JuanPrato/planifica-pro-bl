import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { UserDto } from '../user/dto/user.dto';
import { DayDto } from './dto/day.dto';
import { formatToKey, fromKey } from '../utils/time.util';
import dayjs from 'dayjs';
import { ActivityDto } from './dto/activity.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from "./dto/update-activity.dto";

@Injectable()
export class DayService {
  constructor(private firebase: FirebaseService) {}

  async getDataFromDates(user: UserDto, dates: string[]): Promise<DayDto[]> {
    const result = await this.firebase.getActivities(user, dates);

    return dates.map((date) => {
      return {
        date: fromKey(date),
        activities: result
          .filter((act) => formatToKey(dayjs(act.date)) === date)
          .map((act) => ({
            ...act,
            date: fromKey(date),
          })) as ActivityDto[],
      };
    });
  }

  async addNewActivity(user: UserDto, activity: CreateActivityDto) {
    await this.firebase.saveActivity(user, activity);
  }

  async updateActivity(user: UserDto, activity: UpdateActivityDto) {
    await this.firebase.updateActivity(user, activity);
  }
}

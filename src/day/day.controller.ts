import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DayService } from './day.service';
import { AuthGuard } from '../auth/auth.guard';
import { UserDto } from '../user/dto/user.dto';
import { User } from '../user/user.decorator';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { DocNotFoundError } from '../exceptions/DocNotFoundError';

@UseGuards(AuthGuard)
@Controller('day')
export class DayController {
  constructor(private dayService: DayService) {}

  @Get()
  public async get(
    @User() user: UserDto,
    @Query('dates') dates: string,
  ): Promise<any> {
    if (!dates || dates.split(',').length === 0) {
      throw new BadRequestException();
    }

    return await this.dayService.getDataFromDates(user, dates.split(','));
  }

  @Post()
  public async post(
    @User() user: UserDto,
    @Body() createActivityDto: CreateActivityDto,
  ): Promise<any> {
    await this.dayService.addNewActivity(user, createActivityDto);
  }

  @Put()
  public async put(
    @User() user: UserDto,
    @Body() updateActivityDto: UpdateActivityDto,
  ) {
    if (!updateActivityDto.id) {
      throw new BadRequestException();
    }

    try {
      await this.dayService.updateActivity(user, updateActivityDto);
    } catch (err) {
      if (err instanceof DocNotFoundError) {
        throw new NotFoundException();
      }
    }
  }
}

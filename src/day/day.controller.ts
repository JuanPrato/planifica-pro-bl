import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { DayService } from './day.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('day')
export class DayController {
  constructor(private dayService: DayService) {}

  @Get()
  public get(@Request() req): any {
    return req.user;
  }
}

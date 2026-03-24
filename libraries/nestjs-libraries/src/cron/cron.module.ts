import { Global, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PostSchedulerService } from './post-scheduler.service';

@Global()
@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [PostSchedulerService],
  exports: [PostSchedulerService],
})
export class CronModule {}

import { Module } from '@nestjs/common';
import { NotificationsEmailService } from './notifications-email.service';
import { NotificationsEmailController } from './notifications-email.controller';

@Module({
  controllers: [NotificationsEmailController],
  providers: [NotificationsEmailService],
  exports: [NotificationsEmailService],
})
export class NotificationsEmailModule {}

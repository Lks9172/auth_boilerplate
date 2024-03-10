import { Module } from '@nestjs/common';
import { MailerService } from './application/mailer.service';

@Module({
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}

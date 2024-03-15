import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { SessionService } from './session.service';
import { TypeOrmExModule } from '../database/typeorm-ex.module';
import { SessionRepository } from './repository/session.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session]),
    TypeOrmExModule.forCustomRepository([SessionRepository]),
  ],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}

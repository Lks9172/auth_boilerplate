import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

// Domain Layer
import { User } from './domain/entities/user.entity';
import { UserDomainService } from './domain/services/user.domain.service';

// Ports (Interfaces)
import { UserRepositoryPort } from './domain/ports/user.repository.port';
import { UserServicePort } from './domain/ports/user.service.port';

// Application Layer
import { UserApplicationService } from './application/services/user.application.service';
import { UserCommandHandlers } from './application/handlers/command.handlers';
import { UserQueryHandlers } from './application/handlers/query.handlers';
import { UserEventHandlers } from './application/handlers/event.handlers';

// Infrastructure Layer
import { UserTypeOrmRepository } from './infrastructure/repositories/user.typeorm.repository';
import { UserEntity } from './infrastructure/entities/user.entity';
import { UserRole } from './infrastructure/entities/user-role.entity';
import { UserPermission } from '../permissions/entities/user-permission.entity';

// Presentation Layer
import { UserController } from './presentation/controllers/user.controller';

// Import tokens from ports
import { USER_REPOSITORY } from './domain/ports/user.repository.port';
import { USER_SERVICE } from './domain/ports/user.service.port';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserRole, UserPermission]),
    CqrsModule,
  ],
  providers: [
    // Domain
    UserDomainService,
    
    // Application
    UserApplicationService,
    ...UserCommandHandlers,
    ...UserQueryHandlers,
    ...UserEventHandlers,
    
    // Infrastructure
    UserTypeOrmRepository,
    
    // Infrastructure (Port Implementation)
    {
      provide: USER_REPOSITORY,
      useClass: UserTypeOrmRepository,
    },
    {
      provide: USER_SERVICE,
      useClass: UserApplicationService,
    },
  ],
  controllers: [UserController],
  exports: [USER_SERVICE, USER_REPOSITORY],
})
export class UserModule {}

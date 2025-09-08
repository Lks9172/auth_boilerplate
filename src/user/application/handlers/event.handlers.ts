import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserCreatedEvent } from '../events/user-created.event';
import { UserUpdatedEvent } from '../events/user-updated.event';
import { UserDeletedEvent } from '../events/user-deleted.event';
import { RoleAssignedEvent } from '../events/role-assigned.event';
import { RoleRemovedEvent } from '../events/role-removed.event';

@EventsHandler(UserCreatedEvent)
export class UserCreatedHandler implements IEventHandler<UserCreatedEvent> {
  handle(event: UserCreatedEvent) {
    console.log(`🎉 User created: ${event.userId}`, event.userData);
    // 여기에 추가 로직 (로깅, 알림, 캐시 업데이트 등)
  }
}

@EventsHandler(UserUpdatedEvent)
export class UserUpdatedHandler implements IEventHandler<UserUpdatedEvent> {
  handle(event: UserUpdatedEvent) {
    console.log(`📝 User updated: ${event.userId}`, event.userData);
    // 여기에 추가 로직 (로깅, 알림, 캐시 업데이트 등)
  }
}

@EventsHandler(UserDeletedEvent)
export class UserDeletedHandler implements IEventHandler<UserDeletedEvent> {
  handle(event: UserDeletedEvent) {
    console.log(`🗑️ User deleted: ${event.userId}`);
    // 여기에 추가 로직 (로깅, 알림, 캐시 업데이트 등)
  }
}

@EventsHandler(RoleAssignedEvent)
export class RoleAssignedHandler implements IEventHandler<RoleAssignedEvent> {
  handle(event: RoleAssignedEvent) {
    console.log(`👤 Role assigned: User ${event.userId} -> Role ${event.roleId}`);
    // 여기에 추가 로직 (로깅, 알림, 캐시 업데이트 등)
  }
}

@EventsHandler(RoleRemovedEvent)
export class RoleRemovedHandler implements IEventHandler<RoleRemovedEvent> {
  handle(event: RoleRemovedEvent) {
    console.log(`❌ Role removed: User ${event.userId} -> Role ${event.roleId}`);
    // 여기에 추가 로직 (로깅, 알림, 캐시 업데이트 등)
  }
}

export const UserEventHandlers = [
  UserCreatedHandler,
  UserUpdatedHandler,
  UserDeletedHandler,
  RoleAssignedHandler,
  RoleRemovedHandler,
];

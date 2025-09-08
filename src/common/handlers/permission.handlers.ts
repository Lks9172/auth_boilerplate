import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { 
  PermissionCheckRequestedEvent,
  PermissionCheckCompletedEvent,
  PermissionCheckFailedEvent,
  RoleCheckRequestedEvent,
  RoleCheckCompletedEvent,
} from '../events/permission.events';

// 권한 체크 요청 이벤트 핸들러
@EventsHandler(PermissionCheckRequestedEvent)
export class PermissionCheckRequestedHandler implements IEventHandler<PermissionCheckRequestedEvent> {
  handle(event: PermissionCheckRequestedEvent) {
    console.log(`📤 [CQRS] Permission check requested:`, {
      userId: event.userId,
      permissions: event.requiredPermissions,
      requestId: event.requestId,
      timestamp: event.timestamp,
    });
  }
}

// 권한 체크 완료 이벤트 핸들러
@EventsHandler(PermissionCheckCompletedEvent)
export class PermissionCheckCompletedHandler implements IEventHandler<PermissionCheckCompletedEvent> {
  handle(event: PermissionCheckCompletedEvent) {
    console.log(`✅ [CQRS] Permission check completed:`, {
      requestId: event.requestId,
      userId: event.userId,
      result: event.result,
      strategy: event.strategy,
      permissions: event.permissions,
      timestamp: event.timestamp,
    });
  }
}

// 권한 체크 실패 이벤트 핸들러
@EventsHandler(PermissionCheckFailedEvent)
export class PermissionCheckFailedHandler implements IEventHandler<PermissionCheckFailedEvent> {
  handle(event: PermissionCheckFailedEvent) {
    console.error(`❌ [CQRS] Permission check failed:`, {
      requestId: event.requestId,
      userId: event.userId,
      permissions: event.permissions,
      error: event.error,
      timestamp: event.timestamp,
    });
  }
}

// 역할 체크 요청 이벤트 핸들러
@EventsHandler(RoleCheckRequestedEvent)
export class RoleCheckRequestedHandler implements IEventHandler<RoleCheckRequestedEvent> {
  handle(event: RoleCheckRequestedEvent) {
    console.log(`📤 [CQRS] Role check requested:`, {
      userId: event.userId,
      roles: event.requiredRoles,
      requestId: event.requestId,
      timestamp: event.timestamp,
    });
  }
}

// 역할 체크 완료 이벤트 핸들러
@EventsHandler(RoleCheckCompletedEvent)
export class RoleCheckCompletedHandler implements IEventHandler<RoleCheckCompletedEvent> {
  handle(event: RoleCheckCompletedEvent) {
    console.log(`✅ [CQRS] Role check completed:`, {
      requestId: event.requestId,
      userId: event.userId,
      result: event.result,
      timestamp: event.timestamp,
    });
  }
}

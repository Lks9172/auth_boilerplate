import { Injectable } from '@nestjs/common';
import { PermissionObserver, PermissionEvent } from '../events/permission-events';

@Injectable()
export class PermissionLogObserver implements PermissionObserver {
  onPermissionChanged(event: PermissionEvent): void {
    const logMessage = `[${event.timestamp.toISOString()}] User ${event.userId} ${event.action} permission: ${event.permissionName}`;
    
    // 실제 구현에서는 로그 파일이나 데이터베이스에 저장
    console.log('🔐 Permission Log:', logMessage);
    
    // 보안 감사 로그로 저장
    this.saveAuditLog(event);
  }

  private saveAuditLog(event: PermissionEvent): void {
    // TODO: 실제 구현에서는 데이터베이스에 감사 로그 저장
    // 예: audit_logs 테이블에 저장
    console.log('📋 Audit Log Saved:', {
      userId: event.userId,
      permissionName: event.permissionName,
      action: event.action,
      timestamp: event.timestamp,
      ipAddress: 'N/A', // 실제로는 request에서 추출
      userAgent: 'N/A', // 실제로는 request에서 추출
    });
  }
}


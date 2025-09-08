import { Injectable } from '@nestjs/common';
import { PermissionObserver, PermissionEvent } from '../events/permission-events';

@Injectable()
export class PermissionCacheObserver implements PermissionObserver {
  private permissionCache = new Map<string, Set<string>>(); // userId -> Set<permissionName>

  onPermissionChanged(event: PermissionEvent): void {
    const cacheKey = `user_${event.userId}`;
    
    if (event.action === 'granted') {
      // 권한 부여 시 캐시에 추가
      if (!this.permissionCache.has(cacheKey)) {
        this.permissionCache.set(cacheKey, new Set());
      }
      this.permissionCache.get(cacheKey)?.add(event.permissionName);
    } else if (event.action === 'revoked') {
      // 권한 취소 시 캐시에서 제거
      this.permissionCache.get(cacheKey)?.delete(event.permissionName);
      
      // 빈 Set이면 캐시에서 완전히 제거
      if (this.permissionCache.get(cacheKey)?.size === 0) {
        this.permissionCache.delete(cacheKey);
      }
    }

    console.log(`🔄 Cache updated for user ${event.userId}: ${event.action} ${event.permissionName}`);
  }

  getUserPermissions(userId: number): Set<string> | undefined {
    return this.permissionCache.get(`user_${userId}`);
  }

  clearUserCache(userId: number): void {
    this.permissionCache.delete(`user_${userId}`);
    console.log(`🗑️ Cache cleared for user ${userId}`);
  }

  clearAllCache(): void {
    this.permissionCache.clear();
    console.log('🗑️ All permission cache cleared');
  }
}


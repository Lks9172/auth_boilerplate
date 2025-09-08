import { Injectable } from '@nestjs/common';
import { PermissionCheckContext, PermissionCheckResult } from '../strategies/permission-check.strategy';

// 옵저버 인터페이스
export interface PermissionObserver {
  onPermissionCheck(context: PermissionCheckContext): void;
  onPermissionResult(result: PermissionCheckResult): void;
}

// 로깅 옵저버
@Injectable()
export class PermissionLogObserver implements PermissionObserver {
  onPermissionCheck(context: PermissionCheckContext): void {
    console.log(`📝 [LOG] Permission check started:`, {
      userId: context.userId,
      permissions: context.requiredPermissions,
      requestId: context.requestId,
      timestamp: context.timestamp,
    });
  }

  onPermissionResult(result: PermissionCheckResult): void {
    console.log(`📝 [LOG] Permission check completed:`, {
      strategy: result.strategy,
      result: result.result,
      userId: result.userId,
      permissions: result.permissions,
      timestamp: result.timestamp,
    });
  }
}

// 캐싱 옵저버
@Injectable()
export class PermissionCacheObserver implements PermissionObserver {
  private permissionCache = new Map<string, { result: boolean; expires: Date }>();

  onPermissionCheck(context: PermissionCheckContext): void {
    const cacheKey = this.generateCacheKey(context.userId, context.requiredPermissions);
    const cached = this.permissionCache.get(cacheKey);
    
    if (cached && cached.expires > new Date()) {
      console.log(`💾 [CACHE] Permission result found in cache for user ${context.userId}`);
    }
  }

  onPermissionResult(result: PermissionCheckResult): void {
    const cacheKey = this.generateCacheKey(result.userId, result.permissions);
    
    // 5분간 캐시 저장
    this.permissionCache.set(cacheKey, {
      result: result.result,
      expires: new Date(Date.now() + 5 * 60 * 1000),
    });

    console.log(`💾 [CACHE] Permission result cached for user ${result.userId}`);
  }

  getCachedResult(userId: number, permissions: string[]): boolean | null {
    const cacheKey = this.generateCacheKey(userId, permissions);
    const cached = this.permissionCache.get(cacheKey);
    
    if (cached && cached.expires > new Date()) {
      return cached.result;
    }
    
    return null;
  }

  private generateCacheKey(userId: number, permissions: string[]): string {
    return `${userId}:${permissions.sort().join(',')}`;
  }
}

// 메트릭 수집 옵저버
@Injectable()
export class PermissionMetricsObserver implements PermissionObserver {
  private metrics = {
    totalChecks: 0,
    successfulChecks: 0,
    failedChecks: 0,
    strategyUsage: new Map<string, number>(),
  };

  onPermissionCheck(context: PermissionCheckContext): void {
    this.metrics.totalChecks++;
    console.log(`📊 [METRICS] Total permission checks: ${this.metrics.totalChecks}`);
  }

  onPermissionResult(result: PermissionCheckResult): void {
    if (result.result) {
      this.metrics.successfulChecks++;
    } else {
      this.metrics.failedChecks++;
    }

    const strategyCount = this.metrics.strategyUsage.get(result.strategy) || 0;
    this.metrics.strategyUsage.set(result.strategy, strategyCount + 1);

    console.log(`📊 [METRICS] Success rate: ${(this.metrics.successfulChecks / this.metrics.totalChecks * 100).toFixed(2)}%`);
  }

  getMetrics() {
    return {
      ...this.metrics,
      strategyUsage: Object.fromEntries(this.metrics.strategyUsage),
    };
  }
}

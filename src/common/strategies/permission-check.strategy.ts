// 권한 체크 전략 인터페이스
export interface PermissionCheckStrategy {
  canAccess(userId: number, requiredPermissions: string[]): Promise<boolean>;
  getStrategyName(): string;
  getPriority(): number; // 전략 우선순위 (낮을수록 높은 우선순위)
}

// 권한 체크 결과
export interface PermissionCheckResult {
  strategy: string;
  result: boolean;
  userId: number;
  permissions: string[];
  timestamp: Date;
  metadata?: Record<string, any>;
}

// 권한 체크 컨텍스트
export interface PermissionCheckContext {
  userId: number;
  requiredPermissions: string[];
  requestId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

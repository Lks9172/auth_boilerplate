export interface PermissionCheckStrategy {
  canAccess(userId: number, requiredPermissions: string[]): Promise<boolean>;
  getStrategyName(): string;
}


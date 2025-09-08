import { PermissionCheckContext, PermissionCheckResult } from '../strategies/permission-check.strategy';
import { PermissionObserver } from '../observers/permission-observer';
import { Injectable } from '@nestjs/common';

// 명령 인터페이스
export interface PermissionCommand {
  execute(): Promise<PermissionCheckResult>;
  getContext(): PermissionCheckContext;
}

// 권한 체크 명령
export class PermissionCheckCommand implements PermissionCommand {
  constructor(
    private context: PermissionCheckContext,
    private strategy: any, // PermissionCheckStrategy
    private observers: PermissionObserver[],
  ) {}

  async execute(): Promise<PermissionCheckResult> {
    // 옵저버들에게 명령 시작 알림
    this.notifyObservers('onPermissionCheck', this.context);

    try {
      // 전략을 사용하여 권한 체크 수행
      const result = await this.strategy.canAccess(
        this.context.userId,
        this.context.requiredPermissions,
      );

      const checkResult: PermissionCheckResult = {
        strategy: this.strategy.getStrategyName(),
        result,
        userId: this.context.userId,
        permissions: this.context.requiredPermissions,
        timestamp: new Date(),
        metadata: {
          requestId: this.context.requestId,
          executionTime: Date.now() - this.context.timestamp.getTime(),
        },
      };

      // 옵저버들에게 결과 알림
      this.notifyObservers('onPermissionResult', checkResult);

      return checkResult;
    } catch (error) {
      console.error('❌ Permission check command failed:', error);
      
      const errorResult: PermissionCheckResult = {
        strategy: this.strategy.getStrategyName(),
        result: false,
        userId: this.context.userId,
        permissions: this.context.requiredPermissions,
        timestamp: new Date(),
        metadata: {
          requestId: this.context.requestId,
          error: error.message,
        },
      };

      this.notifyObservers('onPermissionResult', errorResult);
      return errorResult;
    }
  }

  getContext(): PermissionCheckContext {
    return this.context;
  }

  private notifyObservers(method: string, data: any): void {
    this.observers.forEach(observer => {
      try {
        if (observer[method]) {
          observer[method](data);
        }
      } catch (error) {
        console.error(`❌ Observer notification failed for ${method}:`, error);
      }
    });
  }
}

// 명령 실행자 (Invoker)
@Injectable()
export class PermissionCommandExecutor {
  private observers: PermissionObserver[] = [];

  async executeCommand(command: PermissionCommand): Promise<PermissionCheckResult> {
    return command.execute();
  }

  // 옵저버 추가
  addObserver(observer: PermissionObserver): void {
    this.observers.push(observer);
  }

  // 옵저버 제거
  removeObserver(observer: PermissionObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  // 모든 옵저버 가져오기
  getObservers(): PermissionObserver[] {
    return this.observers;
  }
}

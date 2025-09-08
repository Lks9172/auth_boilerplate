import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import { PermissionCheckContext, PermissionCheckResult } from '../strategies/permission-check.strategy';
import { PermissionStrategyFactory, PermissionStrategyType } from '../factories/permission-strategy.factory';
import { PermissionCheckCommand, PermissionCommandExecutor } from '../commands/permission-check.command';
import { PermissionObserver } from '../observers/permission-observer';

// 이벤트 인터페이스 (단일 책임 원칙)
export interface PermissionCheckEvent {
  userId: number;
  requiredPermissions: string[];
  requestId: string;
  timestamp: Date;
  strategyType?: PermissionStrategyType;
}

export interface RoleCheckEvent {
  userId: number;
  requiredRoles: number[];
  requestId: string;
  timestamp: Date;
}

export interface RoleCheckResult {
  requestId: string;
  userId: number;
  result: boolean;
  timestamp: Date;
}

@Injectable()
export class EventBus {
  private observers: PermissionObserver[] = [];

  constructor(
    private eventEmitter: EventEmitter2,
    private strategyFactory: PermissionStrategyFactory,
    private commandExecutor: PermissionCommandExecutor,
  ) {}

  // 옵저버 등록 (개방-폐쇄 원칙)
  addObserver(observer: PermissionObserver): void {
    this.observers.push(observer);
    this.commandExecutor.addObserver(observer);
  }

  // 권한 체크 이벤트 발행 및 결과 대기+
  async checkPermissions(
    userId: number, 
    requiredPermissions: string[],
    strategyType: PermissionStrategyType = PermissionStrategyType.HYBRID
  ): Promise<boolean> {
    const requestId = uuidv4();
    
    return new Promise((resolve) => {
      // 결과를 받기 위한 일회성 리스너
      this.eventEmitter.once(`permission.result.${requestId}`, (result: PermissionCheckResult) => {
        console.log(`🔍 Permission check completed for user ${userId}: ${result.result} (${result.strategy})`);
        resolve(result.result);
      });

      // 이벤트 발행
      this.eventEmitter.emit('permission.check', {
        userId,
        requiredPermissions,
        requestId,
        timestamp: new Date(),
        strategyType,
      } as PermissionCheckEvent);

      console.log(`📤 Permission check requested for user ${userId}: ${requiredPermissions.join(', ')} (strategy: ${strategyType})`);
    });
  }

  // 역할 체크 이벤트 발행 및 결과 대기
  async checkRoles(userId: number, requiredRoles: number[]): Promise<boolean> {
    const requestId = uuidv4();
    
    return new Promise((resolve) => {
      this.eventEmitter.once(`role.result.${requestId}`, (result: RoleCheckResult) => {
        console.log(`🔍 Role check completed for user ${userId}: ${result.result}`);
        resolve(result.result);
      });

      this.eventEmitter.emit('role.check', {
        userId,
        requiredRoles,
        requestId,
        timestamp: new Date(),
      } as RoleCheckEvent);

      console.log(`📤 Role check requested for user ${userId}: ${requiredRoles.join(', ')}`);
    });
  }

  // 권한 체크 결과 발행
  publishPermissionResult(result: PermissionCheckResult): void {
    this.eventEmitter.emit(`permission.result.${result.metadata?.requestId}`, result);
    console.log(`📤 Permission result published: ${result.result} for user ${result.userId}`);
  }

  // 역할 체크 결과 발행
  publishRoleResult(result: RoleCheckResult): void {
    this.eventEmitter.emit(`role.result.${result.requestId}`, result);
    console.log(`📤 Role result published: ${result.result} for user ${result.userId}`);
  }

  // 이벤트 리스닝 (핸들러 등록)
  onPermissionCheck(handler: (event: PermissionCheckEvent) => void): void {
    this.eventEmitter.on('permission.check', handler);
    console.log('🎧 Permission check listener registered');
  }

  onRoleCheck(handler: (event: RoleCheckEvent) => void): void {
    this.eventEmitter.on('role.check', handler);
    console.log('🎧 Role check listener registered');
  }

  // 모든 이벤트 리스닝 (디버깅용)
  onAllEvents(handler: (event: any) => void): void {
    this.eventEmitter.onAny(handler);
    console.log('🎧 All events listener registered');
  }

  // 이벤트 리스너 제거
  removeAllListeners(): void {
    this.eventEmitter.removeAllListeners();
    console.log('🗑️ All event listeners removed');
  }

  // 특정 이벤트 리스너 제거
  removeListener(event: string, handler: (...args: any[]) => void): void {
    this.eventEmitter.removeListener(event, handler);
    console.log(`🗑️ Listener removed for event: ${event}`);
  }

  // 명령 패턴을 사용한 권한 체크 실행
  async executePermissionCheck(
    userId: number,
    requiredPermissions: string[],
    strategyType: PermissionStrategyType = PermissionStrategyType.HYBRID
  ): Promise<PermissionCheckResult> {
    const strategy = this.strategyFactory.createStrategy(strategyType);
    const context: PermissionCheckContext = {
      userId,
      requiredPermissions,
      requestId: uuidv4(),
      timestamp: new Date(),
    };

    const command = new PermissionCheckCommand(context, strategy, this.observers);
    return this.commandExecutor.executeCommand(command);
  }
}

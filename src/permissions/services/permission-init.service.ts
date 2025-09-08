import { Injectable, OnModuleInit } from '@nestjs/common';
import { PermissionEventManager } from '../events/permission-events';
import { PermissionLogObserver } from '../observers/permission-log.observer';
import { PermissionCacheObserver } from '../observers/permission-cache.observer';

@Injectable()
export class PermissionInitService implements OnModuleInit {
  constructor(
    private eventManager: PermissionEventManager,
    private logObserver: PermissionLogObserver,
    private cacheObserver: PermissionCacheObserver,
  ) {}

  onModuleInit() {
    // Observer들을 EventManager에 등록
    this.eventManager.addObserver(this.logObserver);
    this.eventManager.addObserver(this.cacheObserver);
    
    console.log('🎯 Permission observers registered successfully');
  }
}


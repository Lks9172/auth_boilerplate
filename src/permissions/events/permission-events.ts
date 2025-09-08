export interface PermissionEvent {
  userId: number;
  permissionName: string;
  action: 'granted' | 'revoked';
  timestamp: Date;
}

export interface PermissionObserver {
  onPermissionChanged(event: PermissionEvent): void;
}

export class PermissionEventManager {
  private observers: PermissionObserver[] = [];

  addObserver(observer: PermissionObserver): void {
    this.observers.push(observer);
  }

  removeObserver(observer: PermissionObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notifyObservers(event: PermissionEvent): void {
    this.observers.forEach(observer => {
      try {
        observer.onPermissionChanged(event);
      } catch (error) {
        console.error('Observer notification failed:', error);
      }
    });
  }
}


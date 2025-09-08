import { Entity, EntityId } from './base.entity';

export interface RoleProps {
  name: string;
  description?: string;
  level: number;
  parentId?: number;
  isActive: boolean;
  permissionIds: string[];
}

export class Role extends Entity<RoleProps> {
  constructor(props: RoleProps, id?: EntityId) {
    super(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get level(): number {
    return this.props.level;
  }

  get parentId(): number | undefined {
    return this.props.parentId;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get permissionIds(): string[] {
    return this.props.permissionIds;
  }

  // 비즈니스 로직
  hasPermission(permissionId: string): boolean {
    return this.props.permissionIds.includes(permissionId);
  }

  addPermission(permissionId: string): void {
    if (!this.hasPermission(permissionId)) {
      this.props.permissionIds.push(permissionId);
    }
  }

  removePermission(permissionId: string): void {
    this.props.permissionIds = this.props.permissionIds.filter(id => id !== permissionId);
  }

  isChildOf(parentRoleId: number): boolean {
    return this.props.parentId === parentRoleId;
  }

  activate(): void {
    this.props.isActive = true;
  }

  deactivate(): void {
    this.props.isActive = false;
  }

  updateLevel(level: number): void {
    this.props.level = level;
  }

  updateDescription(description: string): void {
    this.props.description = description;
  }
}


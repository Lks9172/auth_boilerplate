import { Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { EntityHelper } from '../../utils/entity-helper';
import { Role } from '../../roles/entities/role.entity';
import { Permission } from './permission.entity';

@Entity()
export class RolePermission extends EntityHelper {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  role: Role;

  @ManyToOne(() => Permission, { eager: true, onDelete: 'CASCADE' })
  permission: Permission;

  @CreateDateColumn()
  createdAt: Date;
}

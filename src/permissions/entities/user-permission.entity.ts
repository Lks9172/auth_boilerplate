import { Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { EntityHelper } from '../../utils/entity-helper';
import { UserEntity } from '../../user/infrastructure/entities/user.entity';
import { Permission } from './permission.entity';

@Entity('user_permission')
export class UserPermission extends EntityHelper {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;

  @ManyToOne(() => Permission, { eager: true })
  permission: Permission;

  @ApiProperty({ example: true })
  @Column({ default: true })
  granted: boolean; // true: 권한 부여, false: 권한 거부

  @ApiProperty({ example: '2024-12-31' })
  @Column({ type: 'datetime', nullable: true })
  expiresAt?: Date; // 권한 만료일 (선택사항)

  @CreateDateColumn()
  createdAt: Date;
}

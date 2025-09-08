import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from './user.entity';
import { Role } from '../../../roles/entities/role.entity';
import { EntityHelper } from '../../../utils/entity-helper';

@Entity('user_role')
export class UserRole extends EntityHelper {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, user => user.userRoles, { onDelete: 'CASCADE' })
  user: UserEntity;

  @ManyToOne(() => Role, role => role.userRoles, { onDelete: 'CASCADE' })
  role: Role;

  @ApiProperty({ example: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ example: '2024-12-31T23:59:59Z' })
  @Column({ type: 'datetime', nullable: true })
  expiresAt?: Date;

  @CreateDateColumn()
  createdAt: Date;
}

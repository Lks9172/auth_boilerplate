import { Column, Entity, PrimaryColumn, ManyToOne, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsNumber } from 'class-validator';
import { EntityHelper } from '../../utils/entity-helper';
import { UserRole } from './user-role.entity';

@Entity()
export class Role extends EntityHelper {
  @ApiProperty({ example: 1 })
  @PrimaryColumn()
  @IsNumber()
  id: number;

  @Allow()
  @ApiProperty({ example: 'Admin' })
  @Column()
  name?: string;

  @ApiProperty({ example: '시스템 관리자' })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({ example: 1 })
  @Column({ default: 0 })
  level: number; // 역할 레벨 (0: 최상위, 숫자가 클수록 하위)

  // 부모 역할 (상위 역할)
  @ManyToOne(() => Role, role => role.children, { nullable: true })
  parent?: Role | null;

  // 자식 역할들 (하위 역할들)
  @OneToMany(() => Role, role => role.parent)
  children?: Role[];

  // 사용자-역할 관계
  @OneToMany(() => UserRole, userRole => userRole.role)
  userRoles?: UserRole[];

  @ApiProperty({ example: true })
  @Column({ default: true })
  isActive: boolean;
}

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { EntityHelper } from '../../utils/entity-helper';

@Entity()
export class Permission extends EntityHelper {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'users:read' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ example: 'Read user information' })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({ example: 'user' })
  @Column()
  resource: string; // 리소스 타입 (user, file, etc.)

  @ApiProperty({ example: 'read' })
  @Column()
  action: string; // 액션 타입 (read, write, delete, etc.)
}

import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm'

@Entity()
export class User extends BaseEntity {
  @Index()
  @Column('varchar', { name: 'role', nullable: false, length: 20, default: 'basicuser'})
  role!: string

  @Index()
  @PrimaryColumn('varchar', {name: 'user_id', nullable: false, unique: true, length: 20})
  userId!: string

  @Column('char', { name: 'password', nullable: false, length: 60})
  password!: string

  @Column('varchar', { name: 'accessToken', nullable: true, length: 256, default: null })
  accessToken!: string

  @Column('varchar', { name: 'refresh_token', nullable: true, length: 256, default: null })
  refreshToken!: string
}

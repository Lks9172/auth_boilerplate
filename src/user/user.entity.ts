import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @Index()
  @PrimaryColumn('varchar', {name: 'user_id', nullable: false, unique: true, length: 20})
  userId!: string;

  @Column('char', { name: 'password', nullable: false, length: 60})
  password!: string;

  @Column('varchar', { name: 'role', nullable: false, length: 20, default: 'basicuser'})
  role!: string;
}

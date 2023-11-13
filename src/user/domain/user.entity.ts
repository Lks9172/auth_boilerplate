import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryColumn('varchar', {
    name: 'user_id',
    nullable: false,
    unique: true,
    length: 20,
  })
  userId!: string;

  @Column('char', { name: 'password', nullable: true, default: null, length: 60 })
  password!: string | null;

  @Column('varchar', {
    name: 'email',
    nullable: false,
    unique: true,
    length: 50,
  })
  email!: string;

  @Column('varchar', {
    name: 'name',
    nullable: false,
    length: 20,
  })
  name!: string;

  @Column({
    type: 'date',
    name: 'birth_date',
    nullable: true,
  })
  birthDate!: Date;

  @Column({
    type: 'boolean',
    name: 'gender',
    nullable: true,
  })
  gender!: boolean;
}

import { BaseEntity, Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryColumn('varchar', {
    name: 'user_id',
    nullable: false,
    unique: true,
    length: 20,
  })
  userId!: string;

  @Column('char', { name: 'password', nullable: false, length: 60 })
  password!: string;

  @PrimaryColumn('varchar', {
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

  @Column('varchar', {
    name: 'birth_date',
    nullable: true,
    length: 20,
  })
  birthDate!: Date;

  @Column({
    type: 'boolean',
    name: 'gender',
    nullable: true,
  })
  gender!: boolean;
}

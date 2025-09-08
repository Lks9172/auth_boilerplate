import { 
  AfterLoad, 
  BeforeInsert, 
  BeforeUpdate, 
  Column, 
  CreateDateColumn,
  DeleteDateColumn, 
  Entity, 
  Index, 
  ManyToOne, 
  OneToMany,
  PrimaryGeneratedColumn, 
  UpdateDateColumn 
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Exclude, Expose } from 'class-transformer';
import { AuthProvidersEnum } from '../../../auth/domain/auth-providers.enum';
import { FileEntity } from '../../../files/entities/file.entity';
import { Role } from '../../../roles/entities/role.entity';
import { Status } from '../../../statuses/entities/status.entity';
import { UserRole } from './user-role.entity';
import { UserPermission } from '../../../permissions/entities/user-permission.entity';
import { EntityHelper } from '../../../utils/entity-helper';

@Entity('user_entity')
export class UserEntity extends EntityHelper {
  @PrimaryGeneratedColumn({
    name: 'user_id',
  })
  id!: number;

  @Column({ type: String, unique: true, nullable: true })
  @Expose({ groups: ['me', 'admin'] })
  email: string | null;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Exclude({ toPlainOnly: true })
  public previousPassword: string;

  @AfterLoad()
  public loadPreviousPassword(): void {
    this.previousPassword = this.password;
  }

  @BeforeInsert()
  @BeforeUpdate()
  async setPassword() {
    if (this.previousPassword !== this.password && this.password) {
      const salt = await bcrypt.genSalt();
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  @Column({ default: AuthProvidersEnum.email })
  @Expose({ groups: ['me', 'admin'] })
  provider: string;

  @Index()
  @Column({ type: String, nullable: true })
  @Expose({ groups: ['me', 'admin'] })
  socialId: string | null;

  @Index()
  @Column({ type: String, nullable: true })
  firstName: string | null;

  @Index()
  @Column({ type: String, nullable: true })
  lastName: string | null;

  @ManyToOne(() => FileEntity, {
    eager: true,
  })
  photo?: FileEntity | null;

  // 단일 역할 (기존 호환성 유지)
  @ManyToOne(() => Role, {
    eager: true,
  })
  role?: Role | null;

  // 다중 역할 지원
  @OneToMany(() => UserRole, userRole => userRole.user, {
    eager: true,
  })
  userRoles?: UserRole[];

  // 직접 권한 지원
  @OneToMany(() => UserPermission, userPermission => userPermission.user, {
    eager: true,
  })
  userPermissions?: UserPermission[];

  @ManyToOne(() => Status, {
    eager: true,
  })
  status?: Status;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}

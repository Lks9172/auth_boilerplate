import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreatePermissionTables1704268800000 implements MigrationInterface {
  name = 'CreatePermissionTables1704268800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Role 테이블 생성 (계층구조 지원)
    await queryRunner.createTable(
      new Table({
        name: 'role',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'level',
            type: 'int',
            default: 0,
          },
          {
            name: 'parentId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
        ],
      }),
      true,
    );

    // Role 자기 참조 외래키 추가
    await queryRunner.createForeignKey(
      'role',
      new TableForeignKey({
        name: 'FK_role_parent',
        columnNames: ['parentId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'role',
        onDelete: 'SET NULL',
      }),
    );

    // User 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'user',
        columns: [
          {
            name: 'user_id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: true,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'provider',
            type: 'varchar',
            length: '50',
            default: "'email'",
          },
          {
            name: 'socialId',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'firstName',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'lastName',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'photoId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'roleId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'statusId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'deletedAt',
            type: 'datetime',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // User -> Role 외래키
    await queryRunner.createForeignKey(
      'user',
      new TableForeignKey({
        name: 'FK_user_role',
        columnNames: ['roleId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'role',
        onDelete: 'SET NULL',
      }),
    );

    // Permission 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'permission',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'resource',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'action',
            type: 'varchar',
            length: '100',
          },
        ],
      }),
      true,
    );

    // UserPermission 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'user_permission',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'userId',
            type: 'int',
          },
          {
            name: 'permissionId',
            type: 'int',
          },
          {
            name: 'granted',
            type: 'boolean',
            default: true,
          },
          {
            name: 'expiresAt',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // RolePermission 테이블 생성
    await queryRunner.createTable(
      new Table({
        name: 'role_permission',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'roleId',
            type: 'int',
          },
          {
            name: 'permissionId',
            type: 'int',
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // UserPermission -> User 외래키
    await queryRunner.createForeignKey(
      'user_permission',
      new TableForeignKey({
        name: 'FK_user_permission_user',
        columnNames: ['userId'],
        referencedColumnNames: ['user_id'],
        referencedTableName: 'user',
        onDelete: 'CASCADE',
      }),
    );

    // UserPermission -> Permission 외래키
    await queryRunner.createForeignKey(
      'user_permission',
      new TableForeignKey({
        name: 'FK_user_permission_permission',
        columnNames: ['permissionId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'permission',
        onDelete: 'CASCADE',
      }),
    );

    // RolePermission -> Role 외래키
    await queryRunner.createForeignKey(
      'role_permission',
      new TableForeignKey({
        name: 'FK_role_permission_role',
        columnNames: ['roleId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'role',
        onDelete: 'CASCADE',
      }),
    );

    // RolePermission -> Permission 외래키
    await queryRunner.createForeignKey(
      'role_permission',
      new TableForeignKey({
        name: 'FK_role_permission_permission',
        columnNames: ['permissionId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'permission',
        onDelete: 'CASCADE',
      }),
    );

    // 기본 권한 데이터 삽입
    await queryRunner.query(`
      INSERT INTO permission (name, description, resource, action) VALUES
      ('users:read', '사용자 정보 조회', 'users', 'read'),
      ('users:write', '사용자 정보 수정', 'users', 'write'),
      ('users:create', '사용자 생성', 'users', 'create'),
      ('users:delete', '사용자 삭제', 'users', 'delete'),
      ('files:read', '파일 조회', 'files', 'read'),
      ('files:write', '파일 수정', 'files', 'write'),
      ('files:upload', '파일 업로드', 'files', 'upload'),
      ('files:delete', '파일 삭제', 'files', 'delete'),
      ('system:config', '시스템 설정', 'system', 'config'),
      ('system:logs', '시스템 로그 조회', 'system', 'logs')
    `);

    // 기본 역할 데이터 삽입
    await queryRunner.query(`
      INSERT INTO role (id, name, description, level, isActive) VALUES
      (1, 'Admin', '시스템 최고 관리자', 0, TRUE),
      (2, 'User', '일반 사용자', 1, TRUE);
    `);

    // 새로운 역할 추가 (계층구조 예시)
    await queryRunner.query(`
      INSERT INTO role (id, name, description, level, parentId, isActive) VALUES
      (3, 'Manager', '부서 관리자', 1, 1, TRUE),
      (4, 'Staff', '직원', 2, 3, TRUE);
    `);

    // Admin 역할에 모든 권한 부여
    await queryRunner.query(`
      INSERT INTO role_permission (roleId, permissionId)
      SELECT 1, id FROM permission;
    `);

    // Manager 역할에 사용자 관련 권한 부여
    await queryRunner.query(`
      INSERT INTO role_permission (roleId, permissionId)
      SELECT 3, id FROM permission WHERE resource = 'users';
    `);

    // Staff 역할에 읽기 권한만 부여
    await queryRunner.query(`
      INSERT INTO role_permission (roleId, permissionId)
      SELECT 4, id FROM permission WHERE action = 'read';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // RolePermission 외래키 제거
    const rolePermissionTable = await queryRunner.getTable('role_permission');
    if (rolePermissionTable) {
      const roleTableForeignKey = rolePermissionTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('roleId') !== -1,
      );
      const permissionTableForeignKey = rolePermissionTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('permissionId') !== -1,
      );

      if (roleTableForeignKey) {
        await queryRunner.dropForeignKey('role_permission', roleTableForeignKey);
      }
      if (permissionTableForeignKey) {
        await queryRunner.dropForeignKey('role_permission', permissionTableForeignKey);
      }
    }

    // UserPermission 외래키 제거
    const userPermissionTable = await queryRunner.getTable('user_permission');
    if (userPermissionTable) {
      const userTableForeignKey = userPermissionTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('userId') !== -1,
      );
      const permissionTableForeignKey = userPermissionTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('permissionId') !== -1,
      );

      if (userTableForeignKey) {
        await queryRunner.dropForeignKey('user_permission', userTableForeignKey);
      }
      if (permissionTableForeignKey) {
        await queryRunner.dropForeignKey('user_permission', permissionTableForeignKey);
      }
    }

    // Role 자기 참조 외래키 제거
    const roleTable = await queryRunner.getTable('role');
    if (roleTable) {
      const parentTableForeignKey = roleTable.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('parentId') !== -1,
      );
      if (parentTableForeignKey) {
        await queryRunner.dropForeignKey('role', parentTableForeignKey);
      }
    }

    // 테이블 삭제
    await queryRunner.dropTable('role_permission', true);
    await queryRunner.dropTable('user_permission', true);
    await queryRunner.dropTable('permission', true);
    await queryRunner.dropTable('user', true);
    await queryRunner.dropTable('role', true);
  }
}

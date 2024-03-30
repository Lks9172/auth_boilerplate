import { Repository } from 'typeorm';
import { CustomRepository } from '../../database/typeorm-ex.decorator';
import { FileEntity } from '../entities/file.entity';

@CustomRepository(FileEntity)
export class FileRepository extends Repository<FileEntity>{
}


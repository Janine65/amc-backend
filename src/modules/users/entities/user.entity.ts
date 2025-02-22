import { ApiProperty } from '@nestjs/swagger';
import { KegelkasseEntity } from '../../kegelkasse/entities/kegelkasse.entity';
import { Exclude, Expose } from 'class-transformer';
import { user } from '@prisma/client';

export class UserEntity implements user {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
  @Expose()
  id: number;

  createdAt: Date;

  updatedAt: Date;

  @Exclude()
  userid: string | null;

  @Exclude()
  salt: string | null;

  @ApiProperty({
    type: 'string',
    nullable: false,
  })
  name: string;

  @ApiProperty({
    type: 'string',
    nullable: false,
  })
  email: string;

  @Exclude()
  password: string;

  @ApiProperty({
    type: 'string',
  })
  role: string;

  @Expose()
  last_login: Date | null;

  @ApiProperty({
    type: () => KegelkasseEntity,
    isArray: true,
    required: false,
  })
  kegelkasse?: KegelkasseEntity[];
}

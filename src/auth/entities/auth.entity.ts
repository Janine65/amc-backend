//src/auth/entity/auth.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { user } from '@prisma/client';
import { Expose, Exclude } from 'class-transformer';
import { KegelkasseEntity } from 'src/modules/kegelkasse/entities/kegelkasse.entity';

export class AuthEntity implements user {
  constructor(partial: Partial<AuthEntity>) {
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

  @ApiProperty()
  accessToken: string;
}

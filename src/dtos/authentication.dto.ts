import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
export class ValidationMiddlewareClass {

}

export class AuthenticateUserDto extends ValidationMiddlewareClass {
    @IsString()
    @IsNotEmpty()
    public email!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(32)
    public password!: string;
}

export class CreateUserDto extends ValidationMiddlewareClass {
    @IsString()
    @IsNotEmpty()
    public role!: string;

    @IsEmail()
    @IsString()
    @IsNotEmpty()
    public email!: string;

    @IsString()
    @IsNotEmpty()
    public name!: string;
}

export class UpdateUserDto extends ValidationMiddlewareClass {
    @IsString()
    @IsNotEmpty()
    public role!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(32)
    public password!: string;

    @IsEmail()
    @IsString()
    @IsNotEmpty()
    public email!: string;

    @IsString()
    @IsNotEmpty()
    public name!: string;
}

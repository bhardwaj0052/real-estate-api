/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(['OWNER', 'BUYER', 'ADMIN'])
  role!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @Type(() => Number)
  @IsNumber()
  phone!: number;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

import {
  IsString,
  IsEmail,
  MinLength,
  IsNumber,
  Min,
  Max,
  IsNotEmpty,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1000000)
  price: number;
}

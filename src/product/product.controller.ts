import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Post(':id')
  update(@Param('id') id: String, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(Number(id), updateProductDto);
  }

  @Get(':id')
  findOne(@Param('id') id: String) {
    return this.productService.findOne(Number(id));
  }

  @Delete(':id/force')
  remove(@Param('id') id: string) {
    return this.productService.remove(Number(id));
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.productService.delete(Number(id));
  }

  @Put(':id')
  restore(@Param('id') id: string) {
    return this.productService.restore(Number(id));
  }
}

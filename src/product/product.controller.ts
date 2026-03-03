import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
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
  create(@Body() createProductDto: CreateProductDto, @Req() req: any) {
    return this.productService.create(createProductDto, req.user.userId);
  }

  @Get()
  findAll(@Query('page') page = '1', @Query('limit') limit = '5') {
    return this.productService.findAll(Number(page), Number(limit));
  }

  @Get('search')
  Search(
    @Query('name') name: string,
    @Query('min') min: string,
    @Query('max') max: string,
  ) {
    return this.productService.Search(name, Number(min), Number(max));
  }

  @Post(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(Number(id), updateProductDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
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

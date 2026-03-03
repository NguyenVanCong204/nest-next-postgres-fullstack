import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}
  async create(createProductDto: CreateProductDto) {
    const { ...data } = createProductDto;
    const product = await this.prisma.product.create({
      data: {
        ...data,
      },
    });

    const { createAt: _, ...productWithoutProduct } = product;

    return {
      message: 'Tạo product mới thành công',
      data: productWithoutProduct,
    };
  }

  async update(id: number, data: UpdateProductDto) {
    const product = await this.prisma.product.update({
      where: { id },
      data,
    });

    return {
      message: 'Cập nhật product thành công',
      data: product,
    };
  }

  async findAll() {
    return await this.prisma.product.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        userId: true,
      },
    });
  }

  async findOne(id: number) {
    return await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        userId: true,
      },
    });
  }

  async delete(id: number) {
    return await this.prisma.product.delete({
      where: { id },
    });
  }

  async remove(id: number) {
    return await this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async restore(id: number) {
    return await this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: null,
      },
    });
  }
}

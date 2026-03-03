import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}
  async create(createProductDto: CreateProductDto, userId: number) {
    const product = await this.prisma.product.create({
      data: {
        ...createProductDto,
        userId: userId,
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

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where: { deletedAt: null },
        skip,
        take: limit,
        orderBy: { createAt: 'desc' },
      }),
      this.prisma.product.count({
        where: { deletedAt: null },
      }),
    ]);
    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async Search(name: string, min: number, max: number) {
    const product = await this.prisma.product.findMany({
      where: {
        deletedAt: null,
        ...(name && {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        }),

        ...(min || max
          ? {
              price: {
                gte: min ? Number(min) : undefined,
                lte: max ? Number(max) : undefined,
              },
            }
          : {}),
      },
    });
    return product;
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product || product.deletedAt !== null) {
      throw new NotFoundException('Product không tồn tại');
    }

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      userId: product.userId,
    };
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

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...rest } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...rest,
        password: hashedPassword,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      message: 'Tạo user thành công',
      data: userWithoutPassword,
    };
  }

  findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
  }

  async update(id: number, data: UpdateUserDto) {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data,
      });

      return {
        message: 'Cập nhật thành công',
        data: user,
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('User không tồn tại');
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const user = await this.prisma.user.delete({
        where: { id },
      });
      return {
        message: 'Xóa user thành công',
      };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('User không tồn tại');
      }
      throw error;
    }
  }
}

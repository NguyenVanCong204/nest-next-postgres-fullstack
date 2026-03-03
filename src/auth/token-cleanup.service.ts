import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TokenCleanupService {
  constructor(private prisma: PrismaService) {}

  @Cron('0 0 * * *')
  async deleteExpiredTokens() {
    await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    console.log('Đã xoá refresh token hết hạn');
  }
}

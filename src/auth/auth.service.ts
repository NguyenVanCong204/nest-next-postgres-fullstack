import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto, req: Request) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      },
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    const payloadRefesh = {
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.id,
    };
    const access_token = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { payloadRefesh },
      { expiresIn: '7d' },
    );
    const hashedToken = await bcrypt.hash(refreshToken, 10);

    await this.prisma.refreshToken.create({
      data: {
        token: hashedToken,
        sessionId: session.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      message: 'Đăng nhập thành công',
      access_token: access_token,
      refresh_token: refreshToken,
    };
  }
  async register(registerDto: RegisterDto) {
    const { email, password, ...rest } = registerDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        ...rest,
        password: hashedPassword,
        role: 'USER',
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      message: 'Đăng kí user thành công',
      data: userWithoutPassword,
    };
  }

  async logout(id: number) {
    await this.prisma.session.deleteMany({
      where: { userId: id },
    });
    return {
      message: 'Logout thành công',
    };
  }

  async refreshToken(token: string) {
    if (!token) {
      throw new UnauthorizedException('Không có refresh token');
    }

    const payload = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });
    console.log(payload);
    if (!payload?.payloadRefesh?.sessionId) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { sessionId: payload.payloadRefesh.sessionId },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token không tồn tại');
    }

    const checkToken = await bcrypt.compare(token, storedToken.token);

    if (!checkToken) {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }

    const newAccessToken = this.jwtService.sign({
      sub: payload.payloadRefesh.id,
      email: payload.payloadRefesh.email,
      role: payload.payloadRefesh.role,
    });

    return {
      accessToken: newAccessToken,
    };
  }
}

import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UsersService } from 'src/users/users.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService)) private userService: UsersService,
    private jwtService: JwtService,
  ) {}
  async create(createAuthDto: CreateAuthDto) {
    const user = await this.userService.create(createAuthDto);
    return user;
  }
  async login(loginAuthDto: LoginAuthDto, res: Response) {
    const { email, password } = loginAuthDto;
    const user = await this.userService.validateUser(email, password);

    const payload = { id: user.id, role: user.role };

    try {
      const refreshToken = await this.jwtService.signAsync(payload, {
        secret: process.env.REFRESH_TOKEN_SECRET_KEY,
        expiresIn: process.env.REFRESH_TOKEN_EXP,
      });
      res.cookie('jwt', refreshToken, {
        maxAge: Number(process.env.COOKIE_EXP),
        httpOnly: true,
      });

      await this.userService.update(user.id, {
        refreshToken,
      });

      return 'Successfully logged in';
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  async refresh(req: Request, res: Response) {
    if (req.cookies) {
      try {
        const { jwt } = req.cookies;
        const verifyToken = await this.jwtService.verifyAsync(jwt, {
          secret: process.env.REFRESH_TOKEN_SECRET_KEY,
        });
        const user = await this.userService.findByRefreshToken(jwt);
        if (user.id !== verifyToken.id)
          throw new UnauthorizedException('Please Login');

        const payload = { id: user.id, role: user.role };

        const accessToken = await this.jwtService.signAsync(payload, {
          secret: process.env.ACCESS_TOKEN_SECRET_KEY,
          expiresIn: process.env.ACCESS_TOKEN_EXP,
        });
        const newRefreshToken = await this.jwtService.signAsync(payload, {
          secret: process.env.REFRESH_TOKEN_SECRET_KEY,
          expiresIn: process.env.REFRESH_TOKEN_EXP,
        });
        res.cookie('jwt', newRefreshToken, {
          maxAge: Number(process.env.COOKIE_EXP),
          httpOnly: true,
        });
        await this.userService.update(user.id, {
          refreshToken: newRefreshToken,
        });
        return { accessToken };
      } catch (error) {
        throw new UnauthorizedException(error.message);
      }
    } else {
      throw new UnauthorizedException('Pls login');
    }
  }
  async logout(req: Request, res: Response) {
    if (req.cookies && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const { jwt } = req.cookies;
        const verifyToken = await this.jwtService.verifyAsync(jwt, {
          secret: process.env.REFRESH_TOKEN_SECRET_KEY,
        });
        const user = await this.userService.findByRefreshToken(jwt);
        if (user.id !== verifyToken.id)
          throw new UnauthorizedException('Token is invalid');

        await this.userService.update(user.id, { refreshToken: null });

        res.clearCookie('jwt', {
          maxAge: Number(process.env.COOKIE_EXP),
          httpOnly: true,
        });
        await this.userService.addToTheBlackList(token, user.id);
        await this.userService.deleteRefreshToken(user.id, jwt);

        return 'Successfully logged out';
      } catch (error) {
        throw new UnauthorizedException(error.message);
      }
    } else {
      throw new UnauthorizedException('Please log in. User is not logged it');
    }
  }
}

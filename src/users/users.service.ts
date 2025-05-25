import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserModel } from './entities/user.model';
import { QueryDto } from './query.dto.ts/query-dto';
import { Response } from 'express';
import { RedisService } from 'src/redis/redis.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserModel) private userRepo: Repository<UserModel>,
    private redisService: RedisService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const userExists = await this.userRepo.findOne({
      where: { email: createUserDto.email, isActive: false },
    });
    if (userExists) {
      userExists.name = createUserDto.name || createUserDto.name;
      userExists.email = createUserDto.email || createUserDto.email;
      userExists.password = createUserDto.password || createUserDto.password;
      userExists.isActive = true;
      userExists.role = createUserDto.role || createUserDto.role;
      return (await this.userRepo.save(userExists)).toJson();
    }

    const user = this.userRepo.create(createUserDto);
    await this.userRepo.save(user);
    await this.redisService.del('user:all');
    return user.toJson();
  }

  async findAll(query: QueryDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    if (page < 1 || limit < 1)
      throw new BadRequestException(`Invalid ${page < 1 ? 'page' : 'limit'}`);
    const offset = (page - 1) * limit;

    const usersCache = await this.redisService.get(`users:list:page:${page}`);
    const userCacheCount = await this.redisService.get('users:totalusersCount');

    const [users, totalUsersCount] = await this.userRepo.findAndCount({
      take: limit,
      skip: offset,
      where: { isActive: true },
      select: [
        'id',
        'email',
        'name',
        'isActive',
        'role',
        'updatedAt',
        'createdAt',
      ],
    });

    let usersTotal: any[];
    let usersCount: number;

    if (usersCache && userCacheCount) {
      usersTotal = JSON.parse(usersCache);
      usersCount = +userCacheCount;
    } else {
      usersTotal = users;
      usersCount = totalUsersCount;
    }

    const totalPages = Math.ceil(usersCount / limit);

    if (users.length === 0) throw new NotFoundException('No users found');

    if (users.length > 0 && totalUsersCount >= 1) {
      await this.redisService.set(`users:list:page:${page}`, users, 60);
      await this.redisService.set(`users:totalusersCount`, totalUsersCount, 60);
    }
    return {
      totalPages,
      usersCount,
      currentPage: page,
      hasNextPage: page < totalPages,
      data: usersTotal,
    };
  }

  async validateUser(email: string, pass: string) {
    const user = await this.userRepo.findOne({
      where: { email, isActive: true },
    });
    if (!user) throw new BadRequestException('Invalid email or password');

    const checkPassword = await user.comparePassword(pass);
    if (!checkPassword)
      throw new BadRequestException('Invalid email or password');

    return user;
  }

  async findOne(id: number) {
    if (id < 1) throw new NotFoundException('Invalid id');
    const userCache = await this.redisService.get(`user:id:${id}`);
    if (userCache) return JSON.parse(userCache);
    const user = await this.userRepo.findOne({ where: { id, isActive: true } });
    if (!user) throw new NotFoundException('User not found');
    await this.redisService.set(`user:id:${id}`, user.toJson(), 60);
    return user.toJson();
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    if (id < 1) throw new NotFoundException('Invalid id');
    const user = await this.userRepo.findOne({ where: { id, isActive: true } });
    if (!user) throw new NotFoundException('User not found');
    user.name = updateUserDto.name || user.name;
    user.email = updateUserDto.email || user.email;
    user.refreshToken = updateUserDto.refreshToken || user.refreshToken;
    user.password = updateUserDto.password || user.password;
    user.isActive = updateUserDto.isActive || user.isActive;
    user.role = updateUserDto.role || user.role;
    await this.redisService.del(`user:id:${id}`);

    return (await this.userRepo.save(user)).toJson();
  }

  async remove(id: number, res: Response) {
    if (id < 1) throw new NotFoundException('Invalid id');
    const user = await this.userRepo.findOne({ where: { id, isActive: true } });
    if (!user) throw new NotFoundException('User not found');
    user.isActive = false;
    await this.userRepo.save(user);
    await this.redisService.del(`user:id:${id}`);
    return res.status(204).json(null);
  }
  async findByRefreshToken(refreshToken: string) {
    const userCache = await this.redisService.get(`user:token:${refreshToken}`);
    if (userCache) return JSON.parse(userCache);
    const user = await this.userRepo.findOne({
      where: { refreshToken },
    });
    if (!user) throw new NotFoundException('No users found. Please register');
    await this.redisService.set(`user:token:${refreshToken}`, user, 60);
    return user;
  }
  async deleteRefreshToken(userId: number, refreshToken: string) {
    if (userId < 1) throw new NotFoundException('Invalid id');
    const user = await this.userRepo.findOne({
      where: { id: userId, isActive: true },
    });
    if (!user) throw new NotFoundException('User not found');
    await this.redisService.del(`user:token:${refreshToken}`);
    user.refreshToken = '';
    await this.userRepo.save(user);
  }

  async addToTheBlackList(token: string, id: number) {
    const exp = jwt.decode(token) as any;
    const now = Date.now();
    return await this.redisService.set(
      `user:blacklist:${token}:${id}`,
      'blacklisted',
      now - exp,
    );
  }
  async getBlacklist(token: string, id: number) {
    return await this.redisService.get(`user:blacklist:${token}:${id}`);
  }
}

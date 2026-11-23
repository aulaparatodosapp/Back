import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.usersRepository.findOneBy({
      email: email.trim().toLowerCase(),
    });
  }

  findByEmailForLogin(email: string) {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', {
        email: email.trim().toLowerCase(),
      })
      .getOne();
  }

  findByGoogleId(googleId: string) {
    return this.usersRepository.findOneBy({ googleId });
  }

  async create(data: {
    name: string;
    email: string;
    passwordHash?: string;
    googleId?: string;
  }) {
    const user = this.usersRepository.create({
      ...data,
      email: data.email.trim().toLowerCase(),
    });
    const saved = await this.usersRepository.save(user);

    return { id: saved.id, name: saved.name, email: saved.email };
  }
}

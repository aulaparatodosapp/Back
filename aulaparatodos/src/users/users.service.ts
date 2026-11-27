import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { normalizeNationalPhone } from './phone-countries';
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
    lastName?: string;
    email: string;
    phoneCountryCode?: string;
    phone?: string;
    birthDate?: string;
    passwordHash?: string;
    googleId?: string;
  }) {
    const user = this.usersRepository.create({
      ...data,
      phone:
        data.phone === undefined
          ? undefined
          : normalizeNationalPhone(data.phone),
      email: data.email.trim().toLowerCase(),
    });
    const saved = await this.usersRepository.save(user);

    return this.toPublicUser(saved);
  }

  async completeProfile(
    userId: string,
    data: {
      lastName: string;
      phoneCountryCode: string;
      phone: string;
      birthDate: string;
    },
  ) {
    const user = await this.usersRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.lastName = data.lastName;
    user.phoneCountryCode = data.phoneCountryCode;
    user.phone = normalizeNationalPhone(data.phone);
    user.birthDate = data.birthDate;

    const saved = await this.usersRepository.save(user);
    return this.toPublicUser(saved);
  }

  private toPublicUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      lastName: user.lastName ?? null,
      email: user.email,
      role: user.role,
      phoneCountryCode: user.phoneCountryCode ?? null,
      phone: user.phone ?? null,
      birthDate: user.birthDate ?? null,
    };
  }

  findById(id: string) {
    return this.usersRepository.findOneBy({ id });
  }

  async getById(id: string) {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.toPublicUser(user);
  }
}

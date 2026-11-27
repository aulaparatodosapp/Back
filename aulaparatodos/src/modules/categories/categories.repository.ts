import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesRepository {
  constructor(
    @InjectRepository(Category)
    private readonly repository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.repository.find();
  }

  async findOne(id: string): Promise<Category | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async findByName(nombre: string): Promise<Category | null> {
    return this.repository.findOne({
      where: { nombre },
    });
  }

  async create(categoryData: Partial<Category>): Promise<Category> {
    const category = this.repository.create(categoryData);
    return this.repository.save(category);
  }

  async update(category: Category): Promise<Category> {
    return this.repository.save(category);
  }

  async remove(category: Category): Promise<void> {
    await this.repository.remove(category);
  }
}

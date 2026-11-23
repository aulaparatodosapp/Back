import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { Category } from './entities/category.entity';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto/categories.dto';
import { CategoriesRepository } from './categories.repository';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly categoriesRepository: CategoriesRepository,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existingCategory =
      await this.categoriesRepository.findByName(createCategoryDto.nombre);

    if (existingCategory) {
      throw new ConflictException('La categoría ya existe');
    }

    return this.categoriesRepository.create(createCategoryDto);
  }

  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.findAll();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne(id);

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);

    if (
      updateCategoryDto.nombre &&
      updateCategoryDto.nombre !== category.nombre
    ) {
      const existingCategory =
        await this.categoriesRepository.findByName(updateCategoryDto.nombre);

      if (existingCategory) {
        throw new ConflictException('La categoría ya existe');
      }
    }

    Object.assign(category, updateCategoryDto);

    return this.categoriesRepository.update(category);
  }

  async remove(id: string): Promise<{ id: string }> {
    const category = await this.findOne(id);

    await this.categoriesRepository.remove(category);

    return { id };
  }
}



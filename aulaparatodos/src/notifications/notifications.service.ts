import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationsRepository } from './notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsRepository: NotificationsRepository){}
  create(createNotificationDto: CreateNotificationDto) {
    this.notificationsRepository.create(createNotificationDto)
  }

  findAll() {
    this.notificationsRepository.findAll()
  }

  findOne(id: number) {
    this.notificationsRepository.findOne(id)
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    this.notificationsRepository.update(id, updateNotificationDto)
  }

  remove(id: number) {
    this.notificationsRepository.remove(id)
  }
}

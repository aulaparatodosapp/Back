import { Controller, Get } from '@nestjs/common';
import { PHONE_COUNTRIES } from './phone-countries';

@Controller('users/phone-countries')
export class PhoneCountriesController {
  @Get()
  findAll() {
    return PHONE_COUNTRIES;
  }
}

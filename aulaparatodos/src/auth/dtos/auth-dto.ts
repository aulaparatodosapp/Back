import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  IsDateString,
  Matches,
  IsIn,
  Validate,
} from 'class-validator';
import {
  PHONE_COUNTRY_CODES,
  PhoneForCountryConstraint,
} from '../../users/phone-countries';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  birthDate!: string;

  @IsIn(PHONE_COUNTRY_CODES)
  phoneCountryCode!: string;

  @IsString()
  @MaxLength(30)
  @Validate(PhoneForCountryConstraint)
  phone!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  confirmPassword!: string;
}

export class LoginDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}

export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty()
  idToken!: string;
}

export class CompleteProfileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @IsIn(PHONE_COUNTRY_CODES)
  phoneCountryCode!: string;

  @IsString()
  @MaxLength(30)
  @Validate(PhoneForCountryConstraint)
  phone!: string;

  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  birthDate!: string;
}

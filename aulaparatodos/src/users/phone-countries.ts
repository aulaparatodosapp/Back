import { isPhoneNumber, ValidatorConstraint } from 'class-validator';
import type {
  ValidationArguments,
  ValidatorConstraintInterface,
} from 'class-validator';

export const PHONE_COUNTRIES = [
  { isoCode: 'AR', name: 'Argentina', dialCode: '+54', label: '+54 ARGENTINA' },
  { isoCode: 'CL', name: 'Chile', dialCode: '+56', label: '+56 CHILE' },
  { isoCode: 'CO', name: 'Colombia', dialCode: '+57', label: '+57 COLOMBIA' },
  { isoCode: 'MX', name: 'México', dialCode: '+52', label: '+52 MÉXICO' },
  { isoCode: 'PE', name: 'Perú', dialCode: '+51', label: '+51 PERÚ' },
  { isoCode: 'UY', name: 'Uruguay', dialCode: '+598', label: '+598 URUGUAY' },
] as const;

export const PHONE_COUNTRY_CODES: string[] = PHONE_COUNTRIES.map(
  (country) => country.dialCode,
);

export function normalizeNationalPhone(phone: string): string {
  return phone.replace(/[\s()-]/g, '');
}

@ValidatorConstraint({ name: 'phoneForCountry', async: false })
export class PhoneForCountryConstraint implements ValidatorConstraintInterface {
  validate(phone: unknown, args: ValidationArguments): boolean {
    const { phoneCountryCode } = args.object as {
      phoneCountryCode?: unknown;
    };

    if (
      typeof phone !== 'string' ||
      typeof phoneCountryCode !== 'string' ||
      !PHONE_COUNTRY_CODES.includes(phoneCountryCode)
    ) {
      return false;
    }

    const nationalPhone = normalizeNationalPhone(phone);
    return (
      /^\d+$/.test(nationalPhone) &&
      isPhoneNumber(phoneCountryCode + nationalPhone)
    );
  }

  defaultMessage(): string {
    return 'El teléfono debe ser válido para el país seleccionado y no incluir el prefijo internacional';
  }
}

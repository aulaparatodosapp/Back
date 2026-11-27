import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { LoginTicket, OAuth2Client } from 'google-auth-library';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { parseEnv } from 'node:util';
import request from 'supertest';
import type { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { Session } from '../src/auth/session.entity';
import { User } from '../src/users/user.entity';

interface PublicUser {
  id: string;
  name: string;
  lastName: string | null;
  email: string;
  phoneCountryCode: string | null;
  phone: string | null;
  birthDate: string | null;
}

interface TokenResponse {
  access_token: string;
}

interface TokenPayload {
  sub: string;
  sid: string;
  iat: number;
  exp: number;
}

const TEST_CLIENT_ID = 'auth-test.apps.googleusercontent.com';
const TEST_PASSWORD = 'ClaveDePrueba123!';

describe('Autenticacion (e2e)', () => {
  const schema = 'auth_test_' + randomUUID().replaceAll('-', '');
  const verifyGoogle =
    jest.fn<
      (options: { idToken: string; audience: string }) => Promise<LoginTicket>
    >();
  let app: INestApplication<App> | undefined;
  let dataSource: DataSource | undefined;
  let jwtService: JwtService;
  let configService: ConfigService;

  function server() {
    if (!app) throw new Error('La aplicacion de prueba no esta inicializada.');
    return app.getHttpServer();
  }

  function database() {
    if (!dataSource) throw new Error('Falta la conexion de prueba.');
    return dataSource;
  }

  function uniqueEmail() {
    return 'auth-' + randomUUID() + '@example.invalid';
  }

  function registrationData(email = uniqueEmail()) {
    return {
      name: 'Usuario de prueba',
      lastName: 'Apellido de prueba',
      email,
      phoneCountryCode: '+54',
      phone: '1155551234',
      birthDate: '2000-05-20',
      password: TEST_PASSWORD,
      confirmPassword: TEST_PASSWORD,
    };
  }

  function googleTicket(sub: string, email: string, verified = true) {
    const now = Math.floor(Date.now() / 1000);

    return new LoginTicket(undefined, {
      iss: 'https://accounts.google.com',
      aud: TEST_CLIENT_ID,
      sub,
      email,
      email_verified: verified,
      name: 'Usuario de prueba Google',
      given_name: 'Usuario',
      family_name: 'Prueba Google',
      iat: now,
      exp: now + 3600,
    });
  }

  async function registerAccount() {
    const response = await request(server())
      .post('/auth/register')
      .send(registrationData())
      .expect(201);

    return response.body as PublicUser;
  }

  async function login(email: string) {
    const response = await request(server())
      .post('/auth/login')
      .send({ email, password: TEST_PASSWORD })
      .expect(200);

    return (response.body as TokenResponse).access_token;
  }

  beforeAll(async () => {
    const settings = parseEnv(
      readFileSync(path.resolve(process.cwd(), '.env'), 'utf8'),
    );
    const databaseHost = settings.DB_HOST;

    if (
      !databaseHost ||
      !['localhost', '127.0.0.1'].includes(databaseHost) ||
      settings.NODE_ENV === 'production'
    ) {
      throw new Error('Estas pruebas requieren la base local de desarrollo.');
    }

    dataSource = new DataSource({
      type: 'postgres',
      host: databaseHost,
      port: Number(settings.DB_PORT),
      username: settings.DB_USERNAME,
      password: settings.DB_PASSWORD,
      database: settings.DB_NAME,
      schema,
      entities: [User, Session],
      synchronize: false,
    });
    await dataSource.initialize();
    await dataSource.query('CREATE SCHEMA "' + schema + '"');
    await dataSource.synchronize();

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getDataSourceToken())
      .useValue(dataSource)
      .overrideProvider(OAuth2Client)
      .useValue({ verifyIdToken: verifyGoogle })
      .compile();

    configService = moduleFixture.get(ConfigService);
    configService.set('GOOGLE_CLIENT_ID', TEST_CLIENT_ID);
    jwtService = moduleFixture.get(JwtService);
    app = moduleFixture.createNestApplication<INestApplication<App>>();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  }, 30000);

  beforeEach(() => {
    verifyGoogle.mockReset();
  });

  afterAll(async () => {
    try {
      if (dataSource?.isInitialized) {
        if (!/^auth_test_[a-f0-9]{32}$/.test(schema)) {
          throw new Error('El esquema de limpieza no pertenece a esta prueba.');
        }
        await dataSource.query(
          'DROP SCHEMA IF EXISTS "' + schema + '" CASCADE',
        );
      }
    } finally {
      if (app) await app.close();
      if (dataSource?.isInitialized) await dataSource.destroy();
    }
  });

  it('ofrece los paises y prefijos sin requerir iniciar sesion', async () => {
    const response = await request(server())
      .get('/users/phone-countries')
      .expect(200);

    expect(response.body).toEqual(
      expect.arrayContaining([
        {
          isoCode: 'AR',
          name: 'Argentina',
          dialCode: '+54',
          label: '+54 ARGENTINA',
        },
        { isoCode: 'CL', name: 'Chile', dialCode: '+56', label: '+56 CHILE' },
        {
          isoCode: 'CO',
          name: 'Colombia',
          dialCode: '+57',
          label: '+57 COLOMBIA',
        },
        { isoCode: 'MX', name: 'México', dialCode: '+52', label: '+52 MÉXICO' },
        { isoCode: 'PE', name: 'Perú', dialCode: '+51', label: '+51 PERÚ' },
        {
          isoCode: 'UY',
          name: 'Uruguay',
          dialCode: '+598',
          label: '+598 URUGUAY',
        },
      ]),
    );
  });

  it.each([
    { country: 'Argentina', phoneCountryCode: '+54', phone: '1155551234' },
    { country: 'Chile', phoneCountryCode: '+56', phone: '961234567' },
    { country: 'Colombia', phoneCountryCode: '+57', phone: '3001234567' },
    { country: 'México', phoneCountryCode: '+52', phone: '5512345678' },
    { country: 'Perú', phoneCountryCode: '+51', phone: '912345678' },
    { country: 'Uruguay', phoneCountryCode: '+598', phone: '99123456' },
  ])(
    'registra el codigo y numero por separado para $country',
    async (country) => {
      const data = {
        ...registrationData(),
        phoneCountryCode: country.phoneCountryCode,
        phone: country.phone,
      };
      const response = await request(server())
        .post('/auth/register')
        .send(data)
        .expect(201);
      const created = response.body as PublicUser;

      expect(created).toMatchObject({
        phoneCountryCode: country.phoneCountryCode,
        phone: country.phone,
      });
      expect(
        await database().getRepository(User).findOneBy({ id: created.id }),
      ).toMatchObject({
        phoneCountryCode: country.phoneCountryCode,
        phone: country.phone,
      });
    },
  );

  it('normaliza el numero nacional sin duplicar el prefijo', async () => {
    const response = await request(server())
      .post('/auth/register')
      .send({ ...registrationData(), phone: '11 5555-1234' })
      .expect(201);

    expect(response.body).toMatchObject({
      phoneCountryCode: '+54',
      phone: '1155551234',
    });
  });

  it('guarda los campos del formulario sin devolver las contrasenas', async () => {
    const data = registrationData();
    const response = await request(server())
      .post('/auth/register')
      .send(data)
      .expect(201);
    const created = response.body as PublicUser;

    expect(created).toEqual({
      id: expect.any(String),
      name: data.name,
      lastName: data.lastName,
      email: data.email,
      phoneCountryCode: data.phoneCountryCode,
      phone: data.phone,
      birthDate: data.birthDate,
    });

    const stored = await database()
      .getRepository(User)
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.id = :id', { id: created.id })
      .getOne();

    expect(stored).toMatchObject({
      lastName: data.lastName,
      phoneCountryCode: data.phoneCountryCode,
      phone: data.phone,
      birthDate: data.birthDate,
    });
    expect(
      await bcrypt.compare(TEST_PASSWORD, stored?.passwordHash ?? ''),
    ).toBe(true);
    expect(stored).not.toHaveProperty('confirmPassword');
  });

  it('rechaza contrasenas diferentes sin crear la cuenta', async () => {
    const data = registrationData();

    await request(server())
      .post('/auth/register')
      .send({ ...data, confirmPassword: 'OtraClaveDePrueba123!' })
      .expect(400);

    expect(
      await database().getRepository(User).findOneBy({ email: data.email }),
    ).toBeNull();
  });

  it.each([
    'lastName',
    'phoneCountryCode',
    'phone',
    'birthDate',
    'confirmPassword',
  ] as const)('rechaza el registro cuando falta %s', async (field) => {
    const data = registrationData();

    await request(server())
      .post('/auth/register')
      .send({ ...data, [field]: undefined })
      .expect(400);

    expect(
      await database().getRepository(User).findOneBy({ email: data.email }),
    ).toBeNull();
  });

  it.each([
    { phone: 'telefono-invalido' },
    { phoneCountryCode: '+1' },
    { phoneCountryCode: '54' },
    { phone: '+541155551234' },
    { phoneCountryCode: '+56' },
    { birthDate: '20/05/2000' },
    { birthDate: '2000-02-30' },
  ])('rechaza datos de perfil invalidos: %j', async (invalid) => {
    const data = registrationData();

    await request(server())
      .post('/auth/register')
      .send({ ...data, ...invalid })
      .expect(400);

    expect(
      await database().getRepository(User).findOneBy({ email: data.email }),
    ).toBeNull();
  });

  it('mantiene el rechazo de correos duplicados con el formulario completo', async () => {
    const user = await registerAccount();

    await request(server())
      .post('/auth/register')
      .send(registrationData(user.email))
      .expect(409);

    expect(
      await database().getRepository(User).countBy({ email: user.email }),
    ).toBe(1);
  });

  it('emite un JWT y rechaza el mismo token despues del logout', async () => {
    const user = await registerAccount();
    const token = await login(user.email);
    const payload = await jwtService.verifyAsync<TokenPayload>(token);

    expect(payload.sub).toBe(user.id);
    expect(payload.exp - payload.iat).toBe(7200);
    expect(
      await database().getRepository(Session).findOneBy({ id: payload.sid }),
    ).toMatchObject({ userId: user.id, revokedAt: null });

    await request(server())
      .post('/auth/logout')
      .set('Authorization', 'Bearer ' + token)
      .expect(204);
    await request(server())
      .post('/auth/logout')
      .set('Authorization', 'Bearer ' + token)
      .expect(401);
  });

  it('no crea sesiones con una contrasena incorrecta', async () => {
    const user = await registerAccount();

    await request(server())
      .post('/auth/login')
      .send({ email: user.email, password: 'OtraClaveIncorrecta!' })
      .expect(401);

    expect(
      await database().getRepository(Session).countBy({ userId: user.id }),
    ).toBe(0);
  });

  it('cerrar una sesion no cierra las otras del mismo usuario', async () => {
    const user = await registerAccount();
    const first = await login(user.email);
    const second = await login(user.email);

    for (const token of [first, second]) {
      await request(server())
        .post('/auth/logout')
        .set('Authorization', 'Bearer ' + token)
        .expect(204);
    }
  });

  it('rechaza tokens ausentes, falsificados, vencidos o con claims invalidos', async () => {
    const user = await registerAccount();
    const token = await login(user.email);
    const payload = await jwtService.verifyAsync<TokenPayload>(token);
    const forged = await jwtService.signAsync(
      { sub: payload.sub, sid: payload.sid },
      { secret: 'una-clave-distinta-de-la-configurada' },
    );
    const expired = await jwtService.signAsync(
      { sub: payload.sub, sid: payload.sid },
      { expiresIn: -1 },
    );
    const invalidClaims = await jwtService.signAsync({
      sub: 'no-es-un-uuid',
      sid: payload.sid,
    });

    await request(server()).post('/auth/logout').expect(401);

    for (const invalid of [forged, expired, invalidClaims]) {
      await request(server())
        .post('/auth/logout')
        .set('Authorization', 'Bearer ' + invalid)
        .expect(401);
    }
  });

  it('rechaza un token que intenta usar la sesion de otro usuario', async () => {
    const first = await registerAccount();
    const second = await registerAccount();
    const token = await login(first.email);
    const payload = await jwtService.verifyAsync<TokenPayload>(token);
    const mixedToken = await jwtService.signAsync({
      sub: second.id,
      sid: payload.sid,
    });

    await request(server())
      .post('/auth/logout')
      .set('Authorization', 'Bearer ' + mixedToken)
      .expect(401);
  });

  it('rechaza una sesion vencida aunque el JWT siga vigente', async () => {
    const user = await registerAccount();
    const token = await login(user.email);
    const payload = await jwtService.verifyAsync<TokenPayload>(token);

    await database()
      .getRepository(Session)
      .update({ id: payload.sid }, { expiresAt: new Date(Date.now() - 1000) });

    await request(server())
      .post('/auth/logout')
      .set('Authorization', 'Bearer ' + token)
      .expect(401);
  });

  it('rechaza credenciales de Google invalidas o no verificadas', async () => {
    const email = uniqueEmail();
    verifyGoogle.mockRejectedValueOnce(new Error('Firma invalida'));

    await request(server())
      .post('/auth/google')
      .send({ idToken: 'credencial-invalida' })
      .expect(401);

    verifyGoogle.mockResolvedValueOnce(
      googleTicket(randomUUID(), email, false),
    );

    await request(server())
      .post('/auth/google')
      .send({ idToken: 'correo-no-verificado' })
      .expect(401);

    expect(
      await database().getRepository(User).findOneBy({ email }),
    ).toBeNull();
  });

  it('crea una cuenta Google sin contrasena y reconoce su sub al volver', async () => {
    const sub = randomUUID();
    const email = uniqueEmail();
    verifyGoogle.mockResolvedValueOnce(googleTicket(sub, email));

    const first = await request(server())
      .post('/auth/google')
      .send({ idToken: 'credencial-de-google' })
      .expect(200);
    const payload = await jwtService.verifyAsync<TokenPayload>(
      (first.body as TokenResponse).access_token,
    );
    const user = await database()
      .getRepository(User)
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.googleId = :sub', { sub })
      .getOne();

    expect(user).toMatchObject({
      id: payload.sub,
      name: 'Usuario',
      lastName: 'Prueba Google',
      googleId: sub,
      passwordHash: null,
      phoneCountryCode: null,
      phone: null,
      birthDate: null,
    });
    expect(verifyGoogle).toHaveBeenCalledWith({
      idToken: 'credencial-de-google',
      audience: TEST_CLIENT_ID,
    });

    verifyGoogle.mockResolvedValueOnce(googleTicket(sub, uniqueEmail()));
    const second = await request(server())
      .post('/auth/google')
      .send({ idToken: 'otra-credencial' })
      .expect(200);
    const returning = await jwtService.verifyAsync<TokenPayload>(
      (second.body as TokenResponse).access_token,
    );

    expect(returning.sub).toBe(payload.sub);
    expect(returning.sid).not.toBe(payload.sid);
    expect(
      await database().getRepository(User).countBy({ googleId: sub }),
    ).toBe(1);
  });

  it('permite completar el perfil de Google solamente con una sesion activa', async () => {
    const sub = randomUUID();
    const email = uniqueEmail();
    verifyGoogle.mockResolvedValueOnce(googleTicket(sub, email));

    const loginResponse = await request(server())
      .post('/auth/google')
      .send({ idToken: 'credencial-de-google' })
      .expect(200);
    const token = (loginResponse.body as TokenResponse).access_token;
    const payload = await jwtService.verifyAsync<TokenPayload>(token);
    const profile = {
      lastName: 'Apellido completado',
      phoneCountryCode: '+54',
      phone: '1155551234',
      birthDate: '2000-05-20',
    };

    await request(server()).patch('/users/me').send(profile).expect(401);

    const response = await request(server())
      .patch('/users/me')
      .set('Authorization', 'Bearer ' + token)
      .send(profile)
      .expect(200);

    expect(response.body).toEqual({
      id: payload.sub,
      name: 'Usuario',
      email,
      ...profile,
    });
    expect(
      await database().getRepository(User).findOneBy({ id: payload.sub }),
    ).toMatchObject({ ...profile, googleId: sub });

    await request(server())
      .post('/auth/logout')
      .set('Authorization', 'Bearer ' + token)
      .expect(204);
    await request(server())
      .patch('/users/me')
      .set('Authorization', 'Bearer ' + token)
      .send(profile)
      .expect(401);
  });

  it('valida el perfil y rechaza cambios de cuenta no permitidos', async () => {
    const user = await registerAccount();
    const token = await login(user.email);

    for (const invalid of [
      { lastName: '', phone: 'invalido', birthDate: 'fecha-invalida' },
      {
        lastName: 'Otro apellido',
        phoneCountryCode: '+54',
        phone: '1155551234',
        birthDate: '2000-05-20',
        email: uniqueEmail(),
      },
      {
        lastName: 'Otro apellido',
        phoneCountryCode: '+1',
        phone: '2025550123',
        birthDate: '2000-05-20',
      },
    ]) {
      await request(server())
        .patch('/users/me')
        .set('Authorization', 'Bearer ' + token)
        .send(invalid)
        .expect(400);
    }

    expect(
      await database().getRepository(User).findOneBy({ id: user.id }),
    ).toMatchObject({
      email: user.email,
      lastName: user.lastName,
      phoneCountryCode: user.phoneCountryCode,
      phone: user.phone,
      birthDate: user.birthDate,
    });
  });

  it('el perfil se actualiza segun el usuario del JWT', async () => {
    const owner = await registerAccount();
    const other = await registerAccount();
    const token = await login(owner.email);
    const profile = {
      lastName: 'Solo cambia el propietario',
      phoneCountryCode: '+54',
      phone: '1155551234',
      birthDate: '1999-04-15',
    };

    const response = await request(server())
      .patch('/users/me')
      .set('Authorization', 'Bearer ' + token)
      .send(profile)
      .expect(200);

    expect((response.body as PublicUser).id).toBe(owner.id);
    expect(
      await database().getRepository(User).findOneBy({ id: owner.id }),
    ).toMatchObject(profile);
    expect(
      await database().getRepository(User).findOneBy({ id: other.id }),
    ).toMatchObject({
      lastName: other.lastName,
      phoneCountryCode: other.phoneCountryCode,
      phone: other.phone,
      birthDate: other.birthDate,
    });
  });

  it('no vincula automaticamente Google a un correo registrado con contrasena', async () => {
    const user = await registerAccount();
    verifyGoogle.mockResolvedValueOnce(googleTicket(randomUUID(), user.email));

    await request(server())
      .post('/auth/google')
      .send({ idToken: 'credencial-con-correo-existente' })
      .expect(409);

    expect(
      await database().getRepository(User).findOneBy({ id: user.id }),
    ).toMatchObject({ googleId: null });
    expect(
      await database().getRepository(Session).countBy({ userId: user.id }),
    ).toBe(0);
  });

  it('tolera dos primeros accesos simultaneos de la misma cuenta Google', async () => {
    const sub = randomUUID();
    const email = uniqueEmail();
    verifyGoogle.mockResolvedValue(googleTicket(sub, email));

    const responses = await Promise.all(
      [1, 2].map(() =>
        request(server())
          .post('/auth/google')
          .send({ idToken: 'misma-cuenta' })
          .expect(200),
      ),
    );
    const payloads = await Promise.all(
      responses.map((response) =>
        jwtService.verifyAsync<TokenPayload>(
          (response.body as TokenResponse).access_token,
        ),
      ),
    );

    expect(payloads[0].sub).toBe(payloads[1].sub);
    expect(
      await database().getRepository(User).countBy({ googleId: sub }),
    ).toBe(1);
  });

  it('valida el DTO de Google antes de consultar al proveedor', async () => {
    await request(server()).post('/auth/google').send({}).expect(400);
    expect(verifyGoogle).not.toHaveBeenCalled();
  });

  it('informa cuando falta configurar el client ID de Google', async () => {
    configService.set('GOOGLE_CLIENT_ID', '');

    try {
      await request(server())
        .post('/auth/google')
        .send({ idToken: 'credencial' })
        .expect(503);
      expect(verifyGoogle).not.toHaveBeenCalled();
    } finally {
      configService.set('GOOGLE_CLIENT_ID', TEST_CLIENT_ID);
    }
  });
});

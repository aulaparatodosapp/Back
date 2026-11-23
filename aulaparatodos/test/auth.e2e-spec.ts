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
import { AppModule } from '../src/app.module';
import { Session } from '../src/auth/session.entity';
import { User } from '../src/users/user.entity';

interface PublicUser {
  id: string;
  name: string;
  email: string;
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

  function googleTicket(sub: string, email: string, verified = true) {
    const now = Math.floor(Date.now() / 1000);

    return new LoginTicket(undefined, {
      iss: 'https://accounts.google.com',
      aud: TEST_CLIENT_ID,
      sub,
      email,
      email_verified: verified,
      name: 'Usuario de prueba Google',
      iat: now,
      exp: now + 3600,
    });
  }

  async function registerAccount() {
    const response = await request(server())
      .post('/auth/register')
      .send({
        name: 'Usuario de prueba',
        email: uniqueEmail(),
        password: TEST_PASSWORD,
      })
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
      googleId: sub,
      passwordHash: null,
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

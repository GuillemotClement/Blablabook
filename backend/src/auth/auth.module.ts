import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PasswordService } from '../security/password/password.service';
import { CookieService } from 'src/security/cookie/cookie.service';
import { TokenService } from 'src/security/token/token.service';
import { TokenRepository } from 'src/security/token/token.respository';
import { AuthGuard } from './auth.guard';
import { getJwtSecret } from './jwt.config';

@Module({
  controllers: [AuthController],
  imports: [
    UserModule,
    JwtModule.register({
      global: true,
      secret: getJwtSecret(),
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [
    AuthService,
    PasswordService,
    CookieService,
    TokenService,
    TokenRepository,
    AuthGuard,
    {
      provide: APP_GUARD,
      useExisting: AuthGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}

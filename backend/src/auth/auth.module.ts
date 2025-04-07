import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AptosSignatureService } from './aptos-signature.service';
import { AuthController } from './auth.controller';
import { Constants } from '../config/constants';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'clippy-secret-key',
      signOptions: { expiresIn: Constants.AUTH.JWT_EXPIRES_IN },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtStrategy, 
    AptosSignatureService,
    {
      provide: JwtAuthGuard,
      useFactory: (jwtService: JwtService, usersService: UsersService, jwtStrategy: JwtStrategy) => {
        return new JwtAuthGuard(jwtService, usersService, jwtStrategy);
      },
      inject: [JwtService, UsersService, JwtStrategy]
    }
  ],
  exports: [
    AuthService, 
    JwtStrategy, 
    PassportModule, 
    JwtModule,
    JwtAuthGuard
  ],
})
export class AuthModule {} 
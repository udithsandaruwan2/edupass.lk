import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { AuthUser } from '../common/decorators/current-user.decorator';

type JwtPayload = {
  sub: string;
  email: string;
  isPlatformAdmin: boolean;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): AuthUser {
    return {
      userId: payload.sub,
      email: payload.email,
      isPlatformAdmin: payload.isPlatformAdmin,
    };
  }
}

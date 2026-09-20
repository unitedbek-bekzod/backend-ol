import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtPayload } from '../../../common/types/jwt-payload.type.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config?.get?.('JWT_ACCESS_SECRET') ?? process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret',
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}

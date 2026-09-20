import * as crypto from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import * as argon2 from 'argon2';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../../models/user.model.js';
import { Admin } from '../../models/admin.model.js';
import { RefreshToken } from '../../models/refresh-token.model.js';
import { NetworkGroup } from '../../models/network-group.model.js';
import { GroupMember } from '../../models/group-member.model.js';
import type { JwtPayload, SubjectType } from '../../common/types/jwt-payload.type.js';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_GROUP_NAME = 'Social media';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Admin) private readonly adminModel: typeof Admin,
    @InjectModel(RefreshToken) private readonly refreshTokenModel: typeof RefreshToken,
    @InjectModel(NetworkGroup) private readonly networkGroupModel: typeof NetworkGroup,
    @InjectModel(GroupMember) private readonly groupMemberModel: typeof GroupMember,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(this.config.get<string>('GOOGLE_CLIENT_ID'));
  }

  async loginWithGoogle(idToken: string): Promise<{ user: User } & TokenPair> {
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: this.config.get<string>('GOOGLE_CLIENT_ID'),
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      throw new UnauthorizedException('Invalid Google token');
    }

    let user = await this.userModel.findOne({ where: { googleId: payload.sub } });
    if (!user) {
      user = await this.userModel.findOne({ where: { email: payload.email } });
    }

    if (!user) {
      user = await this.userModel.create({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name ?? payload.email.split('@')[0],
        avatarUrl: payload.picture ?? null,
      } as any);
      await this.joinDefaultGroup(user.id);
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      await user.save();
    }

    const tokens = await this.issueTokens(user.id, 'user');
    return { user, ...tokens };
  }

  async loginAsAdmin(phone: string, password: string): Promise<{ admin: Admin } & TokenPair> {
    const cleanPhone = phone.trim().replace(/[\s\-()]/g, '');
    const variants = [cleanPhone];
    if (cleanPhone.startsWith('+')) {
      variants.push(cleanPhone.slice(1));
    } else {
      variants.push(`+${cleanPhone}`);
    }
    const admin = await this.adminModel.findOne({ where: { phone: variants } });
    if (!admin || !(await argon2.verify(admin.passwordHash, password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const tokens = await this.issueTokens(admin.id, 'admin');
    return { admin, ...tokens };
  }

  async refresh(rawToken: string): Promise<TokenPair> {
    const tokenHash = this.hashToken(rawToken);
    const stored = await this.refreshTokenModel.findOne({ where: { tokenHash, revoked: false } });
    if (!stored || stored.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token invalid or expired');
    }

    stored.revoked = true;
    await stored.save();

    return this.issueTokens(stored.subjectId, stored.subjectType);
  }

  async logout(rawToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawToken);
    await this.refreshTokenModel.update({ revoked: true }, { where: { tokenHash } });
  }

  private async issueTokens(subjectId: string, subjectType: SubjectType): Promise<TokenPair> {
    const role = subjectType === 'admin' ? 'admin' : 'user';
    const payload: JwtPayload = { sub: subjectId, subjectType, role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET') ?? 'dev-access-secret',
      expiresIn: ACCESS_TOKEN_TTL,
    });

    const rawRefreshToken = crypto.randomBytes(48).toString('hex');
    await this.refreshTokenModel.create({
      subjectId,
      subjectType,
      tokenHash: this.hashToken(rawRefreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    } as any);

    return { accessToken, refreshToken: rawRefreshToken };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async joinDefaultGroup(userId: string): Promise<void> {
    const [group] = await this.networkGroupModel.findOrCreate({
      where: { name: DEFAULT_GROUP_NAME },
      defaults: { type: 'channel', name: DEFAULT_GROUP_NAME, ownerId: null } as any,
    });
    await this.groupMemberModel.findOrCreate({
      where: { groupId: group.id, userId },
      defaults: { groupId: group.id, userId, role: 'member' } as any,
    });
  }
}

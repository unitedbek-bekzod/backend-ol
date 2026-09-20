import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../models/user.model.js';
import { Follow } from '../../models/follow.model.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ProgrammistProfileDto } from './dto/programmist-profile.dto.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Follow) private readonly followModel: typeof Follow,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findByPk(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(id: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, dto);
    await user.save();
    return user;
  }

  async updateProgrammistProfile(id: string, dto: ProgrammistProfileDto): Promise<User> {
    const user = await this.findById(id);
    user.role = 'programmist';
    user.portfolio = { ...(user.portfolio ?? {}), ...dto };
    await user.save();
    return user;
  }

  async follow(followerId: string, followingId: string): Promise<void> {
    if (followerId === followingId) {
      throw new ConflictException('Cannot follow yourself');
    }
    await this.findById(followingId);
    const [, created] = await this.followModel.findOrCreate({
      where: { followerId, followingId },
      defaults: { followerId, followingId } as any,
    });
    if (created) {
      await this.userModel.increment('followersCount', { where: { id: followingId } });
    }
  }

  async unfollow(followerId: string, followingId: string): Promise<void> {
    const deleted = await this.followModel.destroy({ where: { followerId, followingId } });
    if (deleted) {
      await this.userModel.decrement('followersCount', { where: { id: followingId } });
    }
  }

  async listFollowers(userId: string): Promise<User[]> {
    const follows = await this.followModel.findAll({ where: { followingId: userId } });
    const followerIds = follows.map((f) => f.followerId);
    if (!followerIds.length) return [];
    return this.userModel.findAll({ where: { id: followerIds } });
  }
}

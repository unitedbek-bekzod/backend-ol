import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Contact } from '../../models/contact.model.js';
import { NetworkGroup } from '../../models/network-group.model.js';
import { GroupMember } from '../../models/group-member.model.js';
import { Message } from '../../models/message.model.js';
import { User } from '../../models/user.model.js';
import { CreateGroupDto } from './dto/create-group.dto.js';

@Injectable()
export class NetworkService {
  constructor(
    @InjectModel(Contact) private readonly contactModel: typeof Contact,
    @InjectModel(NetworkGroup) private readonly groupModel: typeof NetworkGroup,
    @InjectModel(GroupMember) private readonly memberModel: typeof GroupMember,
    @InjectModel(Message) private readonly messageModel: typeof Message,
    @InjectModel(User) private readonly userModel: typeof User,
  ) {}

  async listContacts(userId: string): Promise<User[]> {
    const contacts = await this.contactModel.findAll({ where: { userId } });
    const contactIds = contacts.map((c) => c.contactUserId);
    if (!contactIds.length) return [];
    return this.userModel.findAll({ where: { id: contactIds } });
  }

  async listGroups(userId: string): Promise<NetworkGroup[]> {
    const memberships = await this.memberModel.findAll({ where: { userId } });
    const groupIds = memberships.map((m) => m.groupId);
    if (!groupIds.length) return [];
    return this.groupModel.findAll({ where: { id: groupIds } });
  }

  async createGroup(ownerId: string, dto: CreateGroupDto): Promise<NetworkGroup> {
    const group = await this.groupModel.create({
      name: dto.name,
      type: dto.type,
      ownerId,
    } as any);
    await this.memberModel.create({ groupId: group.id, userId: ownerId, role: 'owner' } as any);
    return group;
  }

  async assertMember(groupId: string, userId: string): Promise<void> {
    const group = await this.groupModel.findByPk(groupId);
    if (!group) throw new NotFoundException('Group not found');
    const membership = await this.memberModel.findOne({ where: { groupId, userId } });
    if (!membership) throw new ForbiddenException('Not a member of this group');
  }

  async listMessages(groupId: string, userId: string): Promise<Message[]> {
    await this.assertMember(groupId, userId);
    return this.messageModel.findAll({ where: { groupId }, order: [['createdAt', 'ASC']] });
  }

  async sendMessage(groupId: string, senderId: string, content: string): Promise<Message> {
    await this.assertMember(groupId, senderId);
    return this.messageModel.create({ groupId, senderId, content } as any);
  }
}

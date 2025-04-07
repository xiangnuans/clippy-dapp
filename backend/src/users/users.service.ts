import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async findByWalletAddress(walletAddress: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ walletAddress }).exec();
  }

  async createUser(walletAddress: string): Promise<UserDocument> {
    const newUser = new this.userModel({ walletAddress });
    return newUser.save();
  }

  async findOrCreateUser(walletAddress: string): Promise<UserDocument> {
    const user = await this.userModel.findOneAndUpdate(
      { walletAddress },
      {},
      { 
        new: true, 
        upsert: true, 
        setDefaultsOnInsert: true 
      }
    ).exec();
    
    return user;
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<UserDocument> {
    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!updatedUser) {
      throw new NotFoundException(`未找到ID为${id}的用户`);
    }
    return updatedUser;
  }
} 
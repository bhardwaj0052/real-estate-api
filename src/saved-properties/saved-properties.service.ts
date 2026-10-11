import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SavedProperty } from './schemas/saved-property.schema';

@Injectable()
export class SavedPropertiesService {
  constructor(
    @InjectModel(SavedProperty.name)
    private readonly savedPropertyModel: Model<SavedProperty>,
  ) {}

  async saveProperty(userId: string, propertyId: string) {
    try {
      return await this.savedPropertyModel.create({
        userId,
        propertyId,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to save property', {
        cause: error,
      });
    }
  }

  async getSavedProperties(userId: string) {
    try {
      return this.savedPropertyModel.aggregate([
        {
          $match: { userId },
        },
        {
          $lookup: {
            from: 'properties',
            localField: 'propertyId',
            foreignField: 'id',
            as: 'fav',
          },
        },
        {
          $unwind: {
            path: '$fav',
          },
        },
        {
          $replaceRoot: {
            newRoot: '$fav',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'ownerId',
            foreignField: 'id',
            as: 'user',
          },
        },
        {
          $unwind: {
            path: '$user',
          },
        },
        {
          $addFields: {
            phone: '$user.phone',
          },
        },
        {
          $project: {
            user: 0,
          },
        },
      ]);
    } catch {
      throw new InternalServerErrorException(
        'Failed to retrieve saved properties',
      );
    }
  }

  async removeSavedProperty(userId: string, propertyId: string) {
    try {
      const savedProperty = await this.savedPropertyModel.findOneAndDelete({
        userId,
        propertyId,
      });

      if (!savedProperty) {
        throw new NotFoundException('Saved property not found');
      }

      return savedProperty;
    } catch {
      throw new InternalServerErrorException('Failed to remove saved property');
    }
  }
}

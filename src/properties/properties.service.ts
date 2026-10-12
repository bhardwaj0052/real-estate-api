import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Property } from './schemas/property.schema';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyStatusDto } from './dto/update-property-status.dto';
import { User } from 'src/user/schema/userSchema';
import { SavedProperty } from 'src/saved-properties/schemas/saved-property.schema';

@Injectable()
export class PropertiesService {
  constructor(
    @InjectModel(Property.name)
    private readonly propertyModel: Model<Property>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(SavedProperty.name)
    private readonly saveModel: Model<SavedProperty>,
  ) {}
  async findAllProperties(userId: string, role: string) {
    try {
      return role === 'ADMIN'
        ? this.propertyModel.find()
        : this.propertyModel.find({ ownerId: userId });
    } catch {
      throw new InternalServerErrorException('Failed to retrieve properties');
    }
  }

  async findApprovedProperties() {
    try {
      return this.propertyModel.aggregate([
        {
          $match: {
            status: 'APPROVED',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'ownerId',
            foreignField: 'id',
            as: 'owner',
          },
        },
        {
          $unwind: {
            path: '$owner',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            phone: '$owner.phone',
          },
        },
        {
          $project: {
            owner: 0,
          },
        },
      ]);
    } catch {
      throw new InternalServerErrorException(
        'Failed to retrieve approved properties',
      );
    }
  }

  async findApprovedPropertyById(id: string) {
    try {
      const property = await this.propertyModel.findOne({
        id: id,
        status: 'APPROVED',
      });
      const owner = await this.userModel.findOne({
        id: property?.ownerId,
      });

      if (!property) {
        throw new NotFoundException('Property not found');
      }

      return {
        ...property,
        phone: owner?.phone,
      };
    } catch {
      throw new InternalServerErrorException('Failed to retrieve property');
    }
  }

  async createProperty(createPropertyDto: CreatePropertyDto, ownerId: string) {
    try {
      return await this.propertyModel.create({
        ...createPropertyDto,
        ownerId,
        status: 'PENDING',
      });
    } catch {
      throw new InternalServerErrorException('Failed to create property');
    }
  }

  async updatePropertyStatus(updatePropertyStatusDto: UpdatePropertyStatusDto) {
    try {
      const property = await this.propertyModel.findOne({
        id: updatePropertyStatusDto.id,
      });

      if (!property) {
        throw new NotFoundException('Property not found');
      }

      property.status = updatePropertyStatusDto.status;

      if (updatePropertyStatusDto.status === 'APPROVED') {
        property.publishedAt = new Date();
        property.rejectionReason = undefined;
      }

      if (updatePropertyStatusDto.status === 'REJECTED') {
        property.rejectionReason = updatePropertyStatusDto.rejectionReason;
        property.publishedAt = undefined;
      }

      return await property.save();
    } catch {
      throw new InternalServerErrorException(
        'Failed to update property status',
      );
    }
  }

  async deleteProperty(id: string, ownerId: string) {
    try {
      const property = await this.propertyModel.findOneAndDelete({
        id: id,
        ownerId,
      });
      await this.saveModel.findOneAndDelete({ propertyId: id });

      if (!property) {
        throw new NotFoundException('Property not found');
      }

      return property;
    } catch {
      throw new InternalServerErrorException('Failed to delete property');
    }
  }
}

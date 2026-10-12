import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';

import {
  SavedProperty,
  SavedPropertySchema,
} from './schemas/saved-property.schema';

import { SavedPropertiesService } from './saved-properties.service';
import { SavedPropertiesController } from './saved-properties.controller';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      {
        name: SavedProperty.name,
        schema: SavedPropertySchema,
      },
    ]),
  ],
  controllers: [SavedPropertiesController],
  providers: [SavedPropertiesService],
  exports: [MongooseModule],
})
export class SavedPropertiesModule {}

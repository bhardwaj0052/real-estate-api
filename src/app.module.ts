import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { PropertiesModule } from './properties/properties.module';
import { SavedPropertiesModule } from './saved-properties/saved-properties.module';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URL as string),
    AuthModule,
    PropertiesModule,
    SavedPropertiesModule,
  ],
})
export class AppModule {}

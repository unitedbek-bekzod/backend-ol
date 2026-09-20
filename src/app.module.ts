import { Module } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ALL_MODELS } from './models/index.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { BusinessModule } from './modules/business/business.module.js';
import { ProductsModule } from './modules/products/products.module.js';
import { MarketModule } from './modules/market/market.module.js';
import { TemplatesModule } from './modules/templates/templates.module.js';
import { WebsitesModule } from './modules/websites/websites.module.js';
import { PaymentsModule } from './modules/payments/payments.module.js';
import { NetworkModule } from './modules/network/network.module.js';
import { AiModule } from './modules/ai/ai.module.js';
import { AdminModule } from './modules/admin/admin.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        dialect: 'postgres',
        uri: config.get<string>('DATABASE_URL'),
        models: ALL_MODELS,
        autoLoadModels: true,
        synchronize: true,
        logging: false,
      }),
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 20 }],
    }),
    AuthModule,
    UsersModule,
    BusinessModule,
    ProductsModule,
    MarketModule,
    TemplatesModule,
    WebsitesModule,
    PaymentsModule,
    NetworkModule,
    AiModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: Reflector, useValue: new Reflector() },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}

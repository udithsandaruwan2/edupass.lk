import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OrganisationsModule } from './organisations/organisations.module';
import { SeminarsModule } from './seminars/seminars.module';
import { CommerceModule } from './commerce/commerce.module';
import { CheckInModule } from './check-in/check-in.module';
import { BillingModule } from './billing/billing.module';
import { InstituteModule } from './institute/institute.module';
import { TuitionModule } from './tuition/tuition.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    OrganisationsModule,
    SeminarsModule,
    CommerceModule,
    CheckInModule,
    BillingModule,
    InstituteModule,
    TuitionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

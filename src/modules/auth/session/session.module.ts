import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionResolver } from './session.resolver';
import { RedisModule } from '@/src/core/redis/redis.module';
import { VerificationService } from '../verification/verification.service';

@Module({
  imports: [RedisModule],
  providers: [SessionResolver, SessionService, VerificationService],
})
export class SessionModule {}

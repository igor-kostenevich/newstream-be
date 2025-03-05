import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionResolver } from './session.resolver';
import { RedisModule } from '@/src/core/redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [SessionResolver, SessionService],
})
export class SessionModule {}

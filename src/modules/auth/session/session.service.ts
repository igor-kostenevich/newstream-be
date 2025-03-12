import { RedisService } from './../../../core/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './../../../core/prisma/prisma.service';
import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { LoginInput } from './inputs/login.input';
import { verify } from 'argon2';
import type { Request } from 'express';
import { getSessionMetadata } from '@/src/shared/utils/session-metada.util';
import { UserSession } from '@/src/shared/types/session-metadata.types';
import { destroySession, saveSession } from '@/src/shared/utils/session.util';
import { VerificationService } from '../verification/verification.service';

@Injectable()
export class SessionService {
  public constructor(private readonly prismaService: PrismaService, private readonly redisService: RedisService, private readonly configService: ConfigService, private readonly verificationService: VerificationService) {}

  public async findByUser(req: Request) {
    const userId = req.session.userId

    if(!userId) {
      throw new NotFoundException('User not found')
    }

    const keys = await this.redisService.keys('*')

    if (!keys) {
      throw new NotFoundException('No keys found')
    }
    
    const userSession: UserSession[] = []

    for(const key of keys) {
      const sessionData = await this.redisService.get(key)

      if(sessionData) {
        const session = JSON.parse(sessionData)

        if(session.userId === userId) {
          userSession.push({
            ...session,
            id: key.split(':')[1]
          })
        }
      }
    }

    userSession.sort((a, b) => b.createdAt - a.createdAt)

    return userSession.filter(session => session.id !== req.session.id)
  }

  public async findCurrent(req: Request) {
    const sessionId = req.session.id

    if(!sessionId) {
      throw new NotFoundException('Session not found')
    }

    const sessionData = await this.redisService.get(`${this.configService.getOrThrow<string>('SESSION_FOLDER')}${sessionId}`)

    if (!sessionData) {
      throw new NotFoundException('Session not found')
    }
    
    const session = JSON.parse(sessionData)

    return {
      ...session,
      id: sessionId
    }
  }

  public async login(req: Request, input: LoginInput, userAgent: string) {
    const { login, password } = input

    const user = await this.prismaService.user.findFirst({
      where: {
        OR: [
          {
            username: {equals: login}
          },
          {
            email: {equals: login}
          }
        ]
      }
    })

    if(!user) {
      throw new NotFoundException('User not found')
    }

    const isValidPassword = await verify(user.password, password)

    if(!isValidPassword) {
      throw new NotFoundException('Invalid password')
    }

    if(!user.isEmailVerified) {
      await this.verificationService.sendVerificationToken(user)

      throw new BadRequestException('Email not verified, please check your email')
    }

    const metadata = getSessionMetadata(req, userAgent)

    return saveSession(req, user, metadata)
  }

  public async logout(req: Request) {
    return destroySession(req, this.configService)
  }

  public async clearSession(req: Request) {
    req.res?.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'))

    return true
  }

  public async remove(req: Request, id: string) {
    if(req.session.id === id) {
      throw new ConflictException('Cannot remove current session')
    }

    await this.redisService.del(`${this.configService.getOrThrow<string>('SESSION_FOLDER')}${id}`)

    return true
  }
}

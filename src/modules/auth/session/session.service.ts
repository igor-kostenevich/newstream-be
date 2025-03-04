import { ConfigService } from '@nestjs/config';
import { PrismaService } from './../../../core/prisma/prisma.service';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { LoginInput } from './inputs/login.input';
import { verify } from 'argon2';
import type { Request } from 'express';
import { getSessionMetadata } from '@/src/shared/utils/session-metada.util';

@Injectable()
export class SessionService {
  public constructor(private readonly PrismaService: PrismaService, private readonly ConfigService: ConfigService) {}

  public async login(req: Request, input: LoginInput, userAgent: string) {
    const { login, password } = input

    const user = await this.PrismaService.user.findFirst({
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

    const metadata = getSessionMetadata(req, userAgent)

    return new Promise((resolve, reject) => {
      req.session.createdAt = new Date()
      req.session.userId = user.id
      req.session.metadata = metadata

      req.session.save((err) => {
        if(err) {
          return reject(new InternalServerErrorException('Failed to save session'))
        }

        resolve(user) 
      })
    })
  }

  public async logout(req: Request) {
    return new Promise((resolve, reject) => {

      req.session.destroy((err) => {
        if(err) {
          return reject(new InternalServerErrorException('Failed to destroy session'))
        }

        req.res?.clearCookie(this.ConfigService.getOrThrow<string>('SESSION_NAME'))

        resolve(true) 
      })
    }) 
  }
}

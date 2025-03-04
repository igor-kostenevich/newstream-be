import { PrismaService } from './../../core/prisma/prisma.service';
import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";


@Injectable()
export class GqlAuthGuard implements CanActivate {
  public constructor(private readonly PrismaService: PrismaService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req

    if(typeof request.session.userId === 'undefined') { 
      throw new UnauthorizedException('Unauthorized')
    }

    const user = await this.PrismaService.user.findUnique({
      where: {
        id: request.session.userId
      }
    })

    request.user = user

    return true
  }
}
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthUser } from '../decorators/current-user.decorator';

/**
 * Requires `organisationId` on request params or query and verifies
 * the authenticated user is a staff member of that organisation
 * (platform admins bypass).
 */
@Injectable()
export class OrgScopeGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: AuthUser;
      params?: Record<string, string>;
      query?: Record<string, string>;
      body?: { organisationId?: string };
    }>();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Not authenticated');
    }
    if (user.isPlatformAdmin) {
      return true;
    }

    const organisationId =
      request.params?.organisationId ??
      request.query?.organisationId ??
      request.body?.organisationId;
    if (!organisationId) {
      throw new ForbiddenException('organisationId required');
    }

    const membership = await this.prisma.staffMembership.findUnique({
      where: {
        userId_organisationId: {
          userId: user.userId,
          organisationId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Not a member of this organisation');
    }
    return true;
  }
}

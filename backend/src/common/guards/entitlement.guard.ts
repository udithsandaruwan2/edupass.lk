import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EntitlementCode, EntitlementStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthUser } from '../decorators/current-user.decorator';

export const REQUIRED_ENTITLEMENT_KEY = 'requiredEntitlement';
export const RequireEntitlement = (code: EntitlementCode) =>
  SetMetadata(REQUIRED_ENTITLEMENT_KEY, code);

/**
 * Requires organisationId (params/query/body) and an ACTIVE entitlement
 * on that org. Platform admins bypass.
 */
@Injectable()
export class EntitlementGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const code = this.reflector.getAllAndOverride<EntitlementCode | undefined>(
      REQUIRED_ENTITLEMENT_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!code) return true;

    const request = context.switchToHttp().getRequest<{
      user?: AuthUser;
      params?: Record<string, string>;
      query?: Record<string, string>;
      body?: { organisationId?: string };
    }>();

    if (request.user?.isPlatformAdmin) return true;

    const organisationId =
      request.params?.organisationId ??
      request.query?.organisationId ??
      request.body?.organisationId;
    if (!organisationId) {
      throw new ForbiddenException('organisationId required');
    }

    const entitlement = await this.prisma.organisationEntitlement.findUnique({
      where: {
        organisationId_code: { organisationId, code },
      },
    });
    if (!entitlement || entitlement.status !== EntitlementStatus.ACTIVE) {
      throw new ForbiddenException(
        `Organisation lacks ${code} entitlement`,
      );
    }
    return true;
  }
}

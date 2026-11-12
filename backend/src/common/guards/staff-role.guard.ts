import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { StaffRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthUser } from '../decorators/current-user.decorator';

export const REQUIRED_STAFF_ROLES_KEY = 'requiredStaffRoles';
export const RequireStaffRoles = (...roles: StaffRole[]) =>
  SetMetadata(REQUIRED_STAFF_ROLES_KEY, roles);

/**
 * Requires organisationId (params/query/body) and staff membership with
 * one of the listed roles. Platform admins bypass.
 */
@Injectable()
export class StaffRoleGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<StaffRole[] | undefined>(
      REQUIRED_STAFF_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!roles?.length) return true;

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

    const membership = await this.prisma.staffMembership.findUnique({
      where: {
        userId_organisationId: {
          userId: request.user!.userId,
          organisationId,
        },
      },
    });
    if (!membership || !roles.includes(membership.role)) {
      throw new ForbiddenException('Insufficient staff role');
    }
    return true;
  }
}

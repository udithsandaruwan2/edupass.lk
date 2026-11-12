import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

  listBanners() {
    return this.prisma.banner
      .findMany({
        where: { active: true },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          title: true,
          body: true,
          imageUrl: true,
          href: true,
          sortOrder: true,
          createdAt: true,
        },
      })
      .then((rows) =>
        rows.map((b) => ({
          ...b,
          createdAt: b.createdAt.toISOString(),
        })),
      );
  }

  listFaqs() {
    return this.prisma.faq
      .findMany({
        where: { active: true },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          question: true,
          answer: true,
          category: true,
          sortOrder: true,
          createdAt: true,
        },
      })
      .then((rows) =>
        rows.map((f) => ({
          ...f,
          createdAt: f.createdAt.toISOString(),
        })),
      );
  }
}

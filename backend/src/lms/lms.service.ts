import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from './storage.service';
import {
  CreateAssignmentDto,
  CreateMaterialDto,
  CreateModuleDto,
  CreateSubmissionDto,
  GradeSubmissionDto,
} from './dto/lms.dto';

@Injectable()
export class LmsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async createModule(dto: CreateModuleDto) {
    await this.assertBatch(dto.organisationId, dto.batchId);
    const row = await this.prisma.courseModule.create({
      data: {
        organisationId: dto.organisationId,
        batchId: dto.batchId,
        title: dto.title,
        description: dto.description,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
    return this.mapModule(row);
  }

  async createMaterial(dto: CreateMaterialDto) {
    await this.assertModule(dto.organisationId, dto.moduleId);
    let filePath = dto.filePath;
    if (dto.body && !filePath) {
      filePath = await this.storage.saveFromString(dto.body, 'md');
    } else if (dto.url) {
      filePath = await this.storage.saveFromUrl(dto.url);
    }
    const row = await this.prisma.material.create({
      data: {
        moduleId: dto.moduleId,
        title: dto.title,
        url: dto.url,
        body: dto.body,
        filePath: filePath ?? null,
      },
    });
    return {
      id: row.id,
      moduleId: row.moduleId,
      title: row.title,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async createAssignment(dto: CreateAssignmentDto) {
    await this.assertModule(dto.organisationId, dto.moduleId);
    const row = await this.prisma.assignment.create({
      data: {
        moduleId: dto.moduleId,
        title: dto.title,
        description: dto.description,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
        maxScore: dto.maxScore ?? 100,
      },
    });
    return {
      id: row.id,
      moduleId: row.moduleId,
      title: row.title,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async listModulesForStudent(studentUserId: string, batchId?: string) {
    const enrollments = await this.prisma.instituteEnrollment.findMany({
      where: {
        studentUserId,
        ...(batchId ? { batchId } : {}),
      },
    });
    if (!enrollments.length) return [];
    const batchIds = enrollments
      .map((e) => e.batchId)
      .filter((id): id is string => Boolean(id));
    if (!batchIds.length) return [];

    const rows = await this.prisma.courseModule.findMany({
      where: { batchId: { in: batchIds } },
      orderBy: [{ batchId: 'asc' }, { sortOrder: 'asc' }],
      include: {
        materials: true,
        assignments: true,
      },
    });
    return rows.map((m) => ({
      ...this.mapModule(m),
      materials: m.materials.map((mat) => ({
        id: mat.id,
        title: mat.title,
        url: mat.url,
        createdAt: mat.createdAt.toISOString(),
      })),
      assignments: m.assignments.map((a) => ({
        id: a.id,
        title: a.title,
        dueAt: a.dueAt?.toISOString() ?? null,
        createdAt: a.createdAt.toISOString(),
      })),
    }));
  }

  async submitAssignment(studentUserId: string, dto: CreateSubmissionDto) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: dto.assignmentId },
      include: { module: true },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');

    const enrolled = await this.prisma.instituteEnrollment.findFirst({
      where: {
        studentUserId,
        batchId: assignment.module.batchId,
      },
    });
    if (!enrolled) {
      throw new ForbiddenException('Not enrolled in this batch');
    }

    let filePath = dto.filePath;
    if (dto.body && !filePath) {
      filePath = await this.storage.saveFromString(dto.body, 'txt');
    }

    const row = await this.prisma.submission.upsert({
      where: {
        assignmentId_studentUserId: {
          assignmentId: dto.assignmentId,
          studentUserId,
        },
      },
      update: {
        body: dto.body,
        filePath: filePath ?? null,
        submittedAt: new Date(),
      },
      create: {
        assignmentId: dto.assignmentId,
        studentUserId,
        body: dto.body,
        filePath: filePath ?? null,
      },
    });
    return {
      id: row.id,
      assignmentId: row.assignmentId,
      submittedAt: row.submittedAt.toISOString(),
    };
  }

  async listGradesForStudent(studentUserId: string) {
    const rows = await this.prisma.submission.findMany({
      where: {
        studentUserId,
        gradeScore: { not: null },
      },
      include: { assignment: true },
      orderBy: { gradedAt: 'desc' },
    });
    return rows.map((s) => ({
      id: s.id,
      assignmentId: s.assignmentId,
      assignmentTitle: s.assignment.title,
      gradeScore: s.gradeScore,
      gradeFeedback: s.gradeFeedback,
      gradedAt: s.gradedAt?.toISOString() ?? null,
    }));
  }

  async gradeSubmission(
    submissionId: string,
    graderUserId: string,
    dto: GradeSubmissionDto,
  ) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: { include: { module: true } },
      },
    });
    if (!submission) throw new NotFoundException('Submission not found');
    if (submission.assignment.module.organisationId !== dto.organisationId) {
      throw new ForbiddenException('Not your organisation');
    }

    const row = await this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        gradeScore: dto.gradeScore,
        gradeFeedback: dto.gradeFeedback,
        gradedAt: new Date(),
        gradedByUserId: graderUserId,
      },
    });
    return {
      id: row.id,
      gradeScore: row.gradeScore,
      gradedAt: row.gradedAt?.toISOString() ?? null,
    };
  }

  private async assertBatch(organisationId: string, batchId: string) {
    const batch = await this.prisma.batch.findUnique({ where: { id: batchId } });
    if (!batch || batch.organisationId !== organisationId) {
      throw new BadRequestException('Batch not found for organisation');
    }
  }

  private async assertModule(organisationId: string, moduleId: string) {
    const mod = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
    });
    if (!mod || mod.organisationId !== organisationId) {
      throw new NotFoundException('Module not found');
    }
  }

  private mapModule(m: {
    id: string;
    organisationId: string;
    batchId: string;
    title: string;
    description: string | null;
    sortOrder: number;
    createdAt: Date;
  }) {
    return {
      id: m.id,
      organisationId: m.organisationId,
      batchId: m.batchId,
      title: m.title,
      description: m.description,
      sortOrder: m.sortOrder,
      createdAt: m.createdAt.toISOString(),
    };
  }
}

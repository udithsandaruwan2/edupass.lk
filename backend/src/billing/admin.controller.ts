import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { AdminBillingService } from './admin-billing.service';
import {
  AssignSubscriptionDto,
  PatchOrganisationDto,
  UpdateSettingsDto,
  UpsertPlanDto,
} from './dto/billing.dto';
import {
  AdminReviewRefundDto,
  UpsertAnnouncementDto,
  UpsertBannerDto,
  UpsertCategoryDto,
  UpsertFaqDto,
} from './dto/admin-cms.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly admin: AdminBillingService) {}

  @Get('plans')
  listPlans() {
    return this.admin.listPlans();
  }

  @Post('plans')
  createPlan(@Body() dto: UpsertPlanDto) {
    return this.admin.createPlan(dto);
  }

  @Patch('plans/:id')
  updatePlan(@Param('id') id: string, @Body() dto: UpsertPlanDto) {
    return this.admin.updatePlan(id, dto);
  }

  @Get('settings')
  getSettings() {
    return this.admin.getSettings();
  }

  @Put('settings')
  updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.admin.updateSettings(dto);
  }

  @Patch('organisations/:id')
  patchOrg(@Param('id') id: string, @Body() dto: PatchOrganisationDto) {
    return this.admin.patchOrganisation(id, dto);
  }

  @Put('organisations/:id/subscription')
  assignSub(@Param('id') id: string, @Body() dto: AssignSubscriptionDto) {
    return this.admin.assignSubscription(id, dto);
  }

  @Get('revenue/platform-fees')
  platformFees() {
    return this.admin.listPlatformFees();
  }

  @Get('revenue/subscriptions')
  subscriptions() {
    return this.admin.listSubscriptionInvoices();
  }

  @Patch('payments/platform-invoices/:id')
  reviewInvoice(
    @Param('id') id: string,
    @Body() body: { action: 'approve' | 'reject'; reason?: string },
  ) {
    return this.admin.reviewPlatformInvoice(id, body.action, body.reason);
  }

  @Get('users')
  users() {
    return this.admin.listUsers();
  }

  @Get('organisations')
  organisations() {
    return this.admin.listOrganisations();
  }

  @Get('seminars')
  seminars() {
    return this.admin.listSeminars();
  }

  @Get('orders')
  orders() {
    return this.admin.listOrders();
  }

  @Get('tickets')
  tickets() {
    return this.admin.listTickets();
  }

  @Get('refunds')
  refunds() {
    return this.admin.listRefunds();
  }

  @Patch('refunds/:id')
  reviewRefund(
    @Param('id') id: string,
    @Body() dto: AdminReviewRefundDto,
  ) {
    return this.admin.reviewRefund(id, dto.action);
  }

  @Get('banners')
  listBanners() {
    return this.admin.listBanners();
  }

  @Post('banners')
  createBanner(@Body() dto: UpsertBannerDto) {
    return this.admin.createBanner(dto);
  }

  @Patch('banners/:id')
  updateBanner(@Param('id') id: string, @Body() dto: UpsertBannerDto) {
    return this.admin.updateBanner(id, dto);
  }

  @Delete('banners/:id')
  deleteBanner(@Param('id') id: string) {
    return this.admin.deleteBanner(id);
  }

  @Get('faqs')
  listFaqs() {
    return this.admin.listFaqs();
  }

  @Post('faqs')
  createFaq(@Body() dto: UpsertFaqDto) {
    return this.admin.createFaq(dto);
  }

  @Patch('faqs/:id')
  updateFaq(@Param('id') id: string, @Body() dto: UpsertFaqDto) {
    return this.admin.updateFaq(id, dto);
  }

  @Delete('faqs/:id')
  deleteFaq(@Param('id') id: string) {
    return this.admin.deleteFaq(id);
  }

  @Get('announcements')
  listAnnouncements() {
    return this.admin.listAnnouncements();
  }

  @Post('announcements')
  createAnnouncement(@Body() dto: UpsertAnnouncementDto) {
    return this.admin.createAnnouncement(dto);
  }

  @Patch('announcements/:id')
  updateAnnouncement(
    @Param('id') id: string,
    @Body() dto: UpsertAnnouncementDto,
  ) {
    return this.admin.updateAnnouncement(id, dto);
  }

  @Delete('announcements/:id')
  deleteAnnouncement(@Param('id') id: string) {
    return this.admin.deleteAnnouncement(id);
  }

  @Get('categories')
  listCategories() {
    return this.admin.listCategories();
  }

  @Post('categories')
  createCategory(@Body() dto: UpsertCategoryDto) {
    return this.admin.createCategory(dto);
  }

  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: UpsertCategoryDto) {
    return this.admin.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.admin.deleteCategory(id);
  }
}

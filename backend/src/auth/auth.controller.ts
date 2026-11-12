import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterInstitutionDto,
  RegisterLecturerDto,
  RegisterStudentDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  CurrentUser,
  type AuthUser,
} from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register/student')
  registerStudent(@Body() dto: RegisterStudentDto) {
    return this.auth.registerStudent(dto);
  }

  @Post('register/institution')
  registerInstitution(@Body() dto: RegisterInstitutionDto) {
    return this.auth.registerInstitution(dto);
  }

  @Post('register/lecturer')
  registerLecturer(@Body() dto: RegisterLecturerDto) {
    return this.auth.registerLecturer(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.userId);
  }
}

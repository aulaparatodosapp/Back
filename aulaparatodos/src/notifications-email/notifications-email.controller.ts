import { Body, Controller, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { NotificationsEmailService } from './notifications-email.service';
import type {
  AssessmentApprovedPayload,
  CourseApprovedPayload,
  DonationReceiptPayload,
  EnrollmentConfirmationPayload,
  LoginAlertPayload,
  UserRegisterNotificationPayload,
} from './interfaces/mail-payload.interfaces';

@Controller('notifications-email')
export class NotificationsEmailController {
  constructor(
    private readonly notificationsEmailService: NotificationsEmailService,
  ) {}

  @Post('login-alert')
  async sendLoginAlert(
    @Req() req: Request,
    @Body() body: { email: string; userName: string },
  ) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.ip ||
      'Desconocida';
    const userAgent = req.headers['user-agent'] || 'Desconocido';

    const payload: LoginAlertPayload = {
      userName: body.userName,
      ip,
      userAgent,
      loginDate: new Date(),
    };

    return this.notificationsEmailService.sendLoginAlert(body.email, payload);
  }

  @Post('register')
  async sendUserRegister(
    @Body() body: { email: string } & UserRegisterNotificationPayload,
  ) {
    const { email, ...payload } = body;
    return this.notificationsEmailService.sendUserRegister(email, payload);
  }

  @Post('donation-receipt')
  async sendDonationReceipt(
    @Body() body: { email: string } & DonationReceiptPayload,
  ) {
    const { email, ...payload } = body;
    return this.notificationsEmailService.sendDonationReceipt(email, {
      ...payload,
      dateDonor: payload.dateDonor ? new Date(payload.dateDonor) : new Date(),
    });
  }

  @Post('enrollment-confirmation')
  async sendEnrollmentConfirmation(
    @Body() body: { email: string } & EnrollmentConfirmationPayload,
  ) {
    const { email, ...payload } = body;
    return this.notificationsEmailService.sendEnrollmentConfirmation(email, {
      ...payload,
      enrollmentDate: payload.enrollmentDate
        ? new Date(payload.enrollmentDate)
        : new Date(),
    });
  }

  @Post('assessment-approved')
  async sendAssessmentApproved(
    @Body() body: { email: string } & AssessmentApprovedPayload,
  ) {
    const { email, ...payload } = body;
    return this.notificationsEmailService.sendAssessmentApproved(
      email,
      payload,
    );
  }

  @Post('course-approved')
  async sendCourseApproved(
    @Body() body: { email: string } & CourseApprovedPayload,
  ) {
    const { email, ...payload } = body;
    return this.notificationsEmailService.sendCourseApproved(email, {
      ...payload,
      completionDate: payload.completionDate
        ? new Date(payload.completionDate)
        : new Date(),
    });
  }
}

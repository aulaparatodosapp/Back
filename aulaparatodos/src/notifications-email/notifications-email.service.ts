import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AssessmentApprovedPayload,
  CourseApprovedPayload,
  DonationReceiptPayload,
  EnrollmentConfirmationPayload,
  LoginAlertPayload,
  UserRegisterNotificationPayload,
} from './interfaces/mail-payload.interfaces';
import {
  assessmentApprovedTemplate,
  courseApprovedTemplate,
  donationReceiptTemplate,
  enrollmentConfirmationTemplate,
  loginAlertTemplate,
  userRegisterTemplate,
} from './templates/email-templates';

export interface BrevoSendEmailResponse {
  messageId: string;
}

@Injectable()
export class NotificationsEmailService {
  private readonly logger = new Logger(NotificationsEmailService.name);
  private readonly brevoApiUrl = 'https://api.brevo.com/v3/smtp/email';

  constructor(private readonly configService: ConfigService) {}

  private getSenderConfig(): { email: string; name: string } {
    const email: string | undefined =
      this.configService.get('BREVO_SENDER_EMAIL');
    const name: string =
      this.configService.get('BREVO_SENDER_NAME') || 'Aula Para Todos';

    if (!email) {
      throw new InternalServerErrorException(
        'Falta configurar BREVO_SENDER_EMAIL en las variables de entorno.',
      );
    }

    return { email, name };
  }

  private async sendEmail(
    to: { email: string; name?: string },
    subject: string,
    htmlContent: string,
  ): Promise<BrevoSendEmailResponse> {
    const apiKey: string | undefined = this.configService.get('BREVO_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException(
        'Falta configurar BREVO_API_KEY en las variables de entorno.',
      );
    }

    const sender = this.getSenderConfig();

    const response = await fetch(this.brevoApiUrl, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender,
        to: [to.name ? { email: to.email, name: to.name } : { email: to.email }],
        subject,
        htmlContent,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(
        `Error al enviar correo a ${to.email} vía Brevo (${response.status}): ${errorText}`,
      );
      throw new InternalServerErrorException(
        `No se pudo enviar el correo vía Brevo (${response.status})`,
      );
    }

    const data = (await response.json()) as BrevoSendEmailResponse;
    this.logger.log(
      `Correo "${subject}" enviado a ${to.email} (messageId: ${data.messageId})`,
    );
    return data;
  }

  async sendLoginAlert(
    email: string,
    payload: LoginAlertPayload,
  ): Promise<BrevoSendEmailResponse> {
    const html = loginAlertTemplate(payload);
    return this.sendEmail(
      { email, name: payload.userName },
      'Alerta de nuevo inicio de sesión - Aula Para Todos',
      html,
    );
  }

  async sendUserRegister(
    email: string,
    payload: UserRegisterNotificationPayload,
  ): Promise<BrevoSendEmailResponse> {
    const html = userRegisterTemplate(payload);
    return this.sendEmail(
      { email, name: payload.userName },
      '¡Bienvenido/a a Aula Para Todos!',
      html,
    );
  }

  async sendDonationReceipt(
    email: string,
    payload: DonationReceiptPayload,
  ): Promise<BrevoSendEmailResponse> {
    const html = donationReceiptTemplate(payload);
    return this.sendEmail(
      { email, name: payload.donorName },
      'Comprobante de tu donación - Aula Para Todos',
      html,
    );
  }

  async sendEnrollmentConfirmation(
    email: string,
    payload: EnrollmentConfirmationPayload,
  ): Promise<BrevoSendEmailResponse> {
    const html = enrollmentConfirmationTemplate(payload);
    return this.sendEmail(
      { email, name: payload.userName },
      `Inscripción confirmada: ${payload.courseTitle}`,
      html,
    );
  }

  async sendAssessmentApproved(
    email: string,
    payload: AssessmentApprovedPayload,
  ): Promise<BrevoSendEmailResponse> {
    const html = assessmentApprovedTemplate(payload);
    return this.sendEmail(
      { email, name: payload.studentName },
      `¡Aprobaste ${payload.assessmentTitle}! - ${payload.courseTitle}`,
      html,
    );
  }

  async sendCourseApproved(
    email: string,
    payload: CourseApprovedPayload,
  ): Promise<BrevoSendEmailResponse> {
    const html = courseApprovedTemplate(payload);
    return this.sendEmail(
      { email, name: payload.studentName },
      `¡Felicitaciones! Completaste ${payload.courseTitle}`,
      html,
    );
  }
}

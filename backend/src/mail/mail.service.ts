import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';

export type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private readonly from: string;
  private readonly enabled: boolean;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get<string>('SMTP_PORT') ?? 587);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    this.from =
      this.config.get<string>('SMTP_FROM') ??
      'EduPass <noreply@edupass.lk>';
    this.enabled = Boolean(host);

    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: user ? { user, pass } : undefined,
      });
      this.logger.log(`SMTP ready (${host}:${port})`);
    } else {
      this.logger.warn(
        'SMTP_HOST not set — transactional emails will be logged only',
      );
    }
  }

  async send(payload: MailPayload): Promise<void> {
    if (!this.enabled || !this.transporter) {
      this.logger.log(
        `[mail:dry-run] to=${payload.to} subject=${payload.subject}`,
      );
      return;
    }
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        html: payload.html ?? `<p>${payload.text.replace(/\n/g, '<br/>')}</p>`,
      });
    } catch (err) {
      this.logger.error(
        `Failed to send mail to ${payload.to}: ${err instanceof Error ? err.message : err}`,
      );
    }
  }

  welcome(to: string, name: string, kind: 'student' | 'institution' | 'lecturer') {
    const role =
      kind === 'student'
        ? 'student'
        : kind === 'institution'
          ? 'institution organiser'
          : 'lecturer organiser';
    return this.send({
      to,
      subject: 'Welcome to EduPass',
      text: `Hi ${name},\n\nYour EduPass ${role} account is ready. You can sign in and start using the platform.\n\n— EduPass`,
    });
  }

  slipApproved(to: string, name: string, orderId: string) {
    return this.send({
      to,
      subject: 'Payment approved — your tickets are ready',
      text: `Hi ${name},\n\nYour bank slip for order ${orderId} was approved. Open My Tickets in EduPass to view your QR codes.\n\n— EduPass`,
    });
  }

  slipRejected(to: string, name: string, orderId: string, reason?: string) {
    return this.send({
      to,
      subject: 'Payment slip needs attention',
      text: `Hi ${name},\n\nYour bank slip for order ${orderId} was not approved${reason ? `: ${reason}` : ''}. Please upload a new slip from your bookings.\n\n— EduPass`,
    });
  }

  tuitionInvoice(to: string, name: string, title: string, amountLkr: number) {
    return this.send({
      to,
      subject: `Class fees invoice: ${title}`,
      text: `Hi ${name},\n\nA class fees invoice "${title}" for LKR ${amountLkr} is now on your EduPass account. Pay by bank slip or at the institute desk.\n\n— EduPass`,
    });
  }

  passwordReset(to: string, name: string, code: string) {
    return this.send({
      to,
      subject: 'Your EduPass password reset code',
      text: `Hi ${name},\n\nYour password reset code is: ${code}\n\nIf you did not request this, ignore this email.\n\n— EduPass`,
    });
  }

  staffInvite(to: string, name: string, orgName: string, role: string) {
    return this.send({
      to,
      subject: `You were invited to ${orgName} on EduPass`,
      text: `Hi ${name},\n\nYou have been added as ${role} at ${orgName} on EduPass. Sign in to access your panel.\n\n— EduPass`,
    });
  }

  lecturerInvite(to: string, name: string, orgName: string) {
    return this.send({
      to,
      subject: `Lecturer profile created at ${orgName}`,
      text: `Hi ${name},\n\nA lecturer profile was created for you under ${orgName} on EduPass.\n\n— EduPass`,
    });
  }
}

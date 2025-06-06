import nodemailer from 'nodemailer';
import type { EmailTemplate, ContactFormData, NewCommentData } from '../templates';
import { EmailType, contactFormTemplate, newCommentTemplate } from '../templates';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

interface SendEmailOptions {
  to: string;
  from?: string;
  replyTo?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = createTransporter();
  }

  private async sendWithTemplate<T>(
    template: EmailTemplate<T>,
    data: T,
    options: SendEmailOptions
  ) {
    try {
      await this.transporter.verify();

      const mailOptions = {
        from: options.from || `"BWitek.dev" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: options.to,
        replyTo: options.replyTo,
        subject: template.getSubject(data),
        html: template.getHtmlContent(data),
        text: template.getTextContent(data),
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: info.messageId,
        message: 'Email sent successfully'
      };

    } catch (error) {
      console.error('Error sending email:', error);
      
      if (process.env.NODE_ENV === 'development') {
        throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      throw new Error('Failed to send email. Please try again later.');
    }
  }

  async sendContactForm(data: ContactFormData) {
    const options: SendEmailOptions = {
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER!,
      from: `"${data.name}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      replyTo: data.email,
    };

    return this.sendWithTemplate(contactFormTemplate, data, options);
  }

  async sendNewCommentNotification(data: NewCommentData) {
    const options: SendEmailOptions = {
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER!,
      from: `"BWitek.dev Komentarze" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      replyTo: data.authorEmail,
    };

    return this.sendWithTemplate(newCommentTemplate, data, options);
  }
}

export const emailService = new EmailService();
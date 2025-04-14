import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { NotifyEmailDto } from './dto/notify-email.dto';
import axios from 'axios';

@Injectable()
export class NotificationsService {
  constructor(private readonly configService: ConfigService) {}

  private readonly transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: this.configService.get('SMTP_USER'),
      clientId: this.configService.get('GOOGLE_OAUTH_CLIENT_ID'),
      clientSecret: this.configService.get('GOOGLE_OAUTH_CLIENT_SECRET'),
      refreshToken: this.configService.get('GOOGLE_OAUTH_REFRESH_TOKEN'),
    },
  });

  async notifyEmail({ email, text }: NotifyEmailDto) {
    await this.transporter.sendMail({
      from: this.configService.get('SMTP_USER'),
      to: email,
      subject: 'QuickBite Notification',
      text,
    });
  }

  async notifySMS(to: string, message: string) {
    const userId = this.configService.get('NOTIFYLK_USER_ID');
    const apiKey = this.configService.get('NOTIFYLK_API_KEY');
    const senderId = this.configService.get('NOTIFYLK_SENDER_ID');

    const url = `https://app.notify.lk/api/v1/send`;

    const params = {
      user_id: userId,
      api_key: apiKey,
      sender_id: senderId,
      to,
      message,
    };

    try {
      const response = await axios.get(url, { params });
      console.log('SMS sent:', response.data);
    } catch (error) {
      console.error(
        'Failed to send SMS:',
        error.response?.data || error.message,
      );
    }
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/email/email.service';
import { format } from 'date-fns';

@Injectable()
export class WanStatusService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}


  async findAll() {
    return this.prisma.mikroTik.findMany({
      select: {
        id: true,
        identity: true,
        comment: true,
        status: true,
        since: true,
        createdAt: true,
      },
    });
  }

  // Function to save WAN status data and handle email & Telegram alerts
  async saveData(data: {
    identity: string;
    comment: string;
    status: string;
    since: string;
  }): Promise<void> {
    try {
      // Fetch the most recent record for the given identity and comment
      const previousStatus = await this.prisma.mikroTik.findFirst({
        where: {
          identity: data.identity,
          comment: data.comment,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Check if the status has changed
      if (!previousStatus || previousStatus.status !== data.status) {
        const formattedSince = new Date(data.since).toLocaleString('en-GB', {
          hour12: true,
        });

        // Save the new status to the database
        await this.prisma.mikroTik.create({
          data: {
            identity: data.identity,
            comment: data.comment,
            status: data.status,
            since: formattedSince,
          },
        });

        // Fetch the device data, including emailId (stored as JSON or array)
        const device = await this.prisma.device.findFirst({
          where: { deviceId: data.identity }, // Assuming identity matches the deviceId
          select: { emailId: true }, // Fetch only the emailId field
        });

        const alertMessage = `${data.identity} Gateway's ${data.comment} is ${data.status}`;

        // Trigger email notification
        if (device) {
          const emailRecipients = this.parseEmailIds(device.emailId);
          if (emailRecipients.length > 0) {
            await this.emailService.sendEmail({
              recipients: emailRecipients,
              subject: alertMessage,
              html: `
                <div>
                  <h1>${alertMessage}</h1>
                  <p>The WAN status has changed to <strong>${data.status}</strong> since ${formattedSince}.</p>
                  <img src="${
                    data.status.toLowerCase() === 'up'
                      ? 'https://thumbs.dreamstime.com/b/green-arrow-pointing-up-isolated-d-illustration-green-arrow-pointing-up-isolated-335047632.jpg'
                      : 'https://media.istockphoto.com/id/1389684537/photo/red-down-arrow-isolated-on-white-background-with-shadow-fall-and-decline-concept-3d-render.jpg?s=612x612&w=0&k=20&c=xl0hH7k27JsIrUHPWvxxykim5J-SnawRSEPDnlWYPfc='
                  }" alt="${
                data.status === 'up' ? 'Green up arrow' : 'Red down arrow'
              }" style="width:200px;height:auto;" />
                </div>
              `,
            });
          }
        }

        // Trigger Telegram notification
        await this.sendTelegramAlert(alertMessage);
      }
    } catch (error) {
      console.error('Error in saveData:', error);
      throw error;
    }
  }

  // Function to send Telegram alert
  private async sendTelegramAlert(message: string): Promise<void> {
    const telegramBotToken = '5812072071:AAEZD1qVjmKBJ9h7f9HQDETeKQ6ffBKRtck';
    const chatId = '-4609047914'; // Replace with your chat ID
    const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(
      message,
    )}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to send Telegram alert');
      }
      console.log('Telegram alert sent successfully');
    } catch (error) {
      console.error('Error sending Telegram alert:', error);
    }
  }

  // Helper function to parse email IDs from JSON or array
  private parseEmailIds(emailId: any): string[] {
    try {
      if (Array.isArray(emailId)) {
        return emailId;
      }

      if (typeof emailId === 'string') {
        const parsedEmails = JSON.parse(emailId).filter(
          (email: string) => typeof email === 'string',
        );
        return parsedEmails;
      }

      console.warn('Email ID is not a valid string or array:', emailId);
      return [];
    } catch (error) {
      console.error('Error parsing email IDs:', error);
      return [];
    }
  }

  // Fetch logs based on the deviceId (identity)
  async getLogsByDeviceId(deviceId: string): Promise<any[]> {
    try {
      const logs = await this.prisma.mikroTik.findMany({
        where: {
          identity: deviceId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return logs.map((log) => ({
        ...log,
        createdAt: format(new Date(log.createdAt), 'dd/MM/yyyy , HH:mm:ss'),
      }));
    } catch (error) {
      console.error('Error fetching logs by deviceId:', error);
      throw new Error(
        'Unable to fetch logs for the specified device. Please try again.',
      );
    }
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/email/email.service';
import { format } from 'date-fns';

export interface sendEmailDto {
  recipients: string[]; // For "to" recipients
  subject: string;
  html: string;
  bcc?: string[]; // Add this line for BCC recipients
}


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

      // Fetch the device data, including emailId and telegramId
      const device = await this.prisma.device.findFirst({
        where: { deviceId: data.identity }, // Assuming identity matches the deviceId
        select: { emailId: true, telegramId: true }, // Fetch both emailId and telegramId
      });

      const alertMessage = `${data.identity} Gateway's ${data.comment} is ${data.status}`;

      // Trigger email notification
      if (device) {
        const emailRecipients = this.parseEmailIds(device.emailId);
  if (emailRecipients.length > 0) {
    await this.emailService.sendEmail({
      recipients: ["waghmaresujit49@gmail.com"], 
      bcc: emailRecipients,
      subject: alertMessage,
      html: `
        <div>
          <h1>${alertMessage}</h1>
          <p>The WAN status has changed to <strong>${data.status}</strong> since ${formattedSince}.</p>
        </div>
      `,
    });
        }

        // Trigger Telegram notifications if telegramId exists and is valid
        if (device.telegramId) {
          const telegramIds = this.parseTelegramIds(device.telegramId);
          for (const telegramId of telegramIds) {
            await this.sendTelegramAlert(alertMessage, telegramId);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in saveData:', error);
    throw error;
  }
}

// Function to send Telegram alert dynamically based on telegramId
private async sendTelegramAlert(message: string, telegramId: string): Promise<void> {
  const telegramBotToken = '5812072071:AAEZD1qVjmKBJ9h7f9HQDETeKQ6ffBKRtck';
  const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage?chat_id=${telegramId}&text=${encodeURIComponent(
    message,
  )}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to send Telegram alert');
    }
  } catch (error) {
    console.error(`Error sending Telegram alert to ${telegramId}:`, error);
  }
}

// Helper function to parse telegram IDs from JSON or array
private parseTelegramIds(telegramId: any): string[] {
  try {
    if (Array.isArray(telegramId)) {
      return telegramId.map(String); // Convert all IDs to strings
    }

    if (typeof telegramId === 'string') {
      const parsedIds = JSON.parse(telegramId).filter(
        (id: string | number) => typeof id === 'string' || typeof id === 'number',
      );
      return parsedIds.map(String); // Ensure all IDs are strings
    }

    console.warn('Telegram ID is not a valid string or array:', telegramId);
    return [];
  } catch (error) {
    console.error('Error parsing Telegram IDs:', error);
    return [];
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

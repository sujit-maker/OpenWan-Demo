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

  // Function to save WAN status data and handle email alerts
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
        const newStatus = await this.prisma.mikroTik.create({
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

        if (device) {

          // Parse email IDs from JSON field or use them directly if already in array format
          const emailRecipients = this.parseEmailIds(device.emailId);

          if (emailRecipients.length > 0) {
            console.log(
              `Emails fetched for identity "${data.identity}":`,
              emailRecipients,
            );

            // Send email notification about the status change
            await this.emailService.sendEmail({
              recipients: emailRecipients,
              subject: `${data.identity} Gateway's ${data.comment} is ${data.status}`,
              html: `
                <div>
                  <h1>${data.identity} Gateway's ${data.comment} is ${data.status}</h1>
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

          } else {
            console.warn(
              `No valid email addresses found for identity "${data.identity}".`,
            );
          }
        } else {
          console.warn(`No device found for identity "${data.identity}".`);
        }
      } else {
        console.log(
          `Status for identity "${data.identity}" and comment "${data.comment}" has not changed. No email sent.`,
        );
      }
    } catch (error) {
      console.error('Error in saveData:', error);
      throw error;
    }
  }

  // Helper function to parse email IDs from JSON or array
  private parseEmailIds(emailId: any): string[] {
    try {
      if (Array.isArray(emailId)) {
        return emailId; // Directly return the array if emailId is already an array
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

  // Function to retrieve logs
  async getLogs(): Promise<any[]> {
    try {
      const logs = await this.prisma.mikroTik.findMany();

      const formattedLogs = logs.map((log) => {
        const formattedCreatedAt = format(
          new Date(log.createdAt),
          'dd/MM/yyyy , HH:mm:ss',
        );
        return {
          ...log,
          createdAt: formattedCreatedAt,
        };
      });

      return formattedLogs;
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw error;
    }
  }
}

import { Body, Controller, Get, HttpException, HttpStatus, Post } from '@nestjs/common';
import { WanStatusService } from './wan-status.service';

@Controller('wanstatus')
export class WanStatusController {
  constructor(private readonly wanStatusService: WanStatusService) {}

  @Post()
  async receiveData(
    @Body() data: { identity: string; comment: string; status: string; since: string },
  ): Promise<{ message: string; data: any }> {
    try {
      const sinceDateString = new Date(data.since).toISOString();

      // Call the service to save the WAN status change
      await this.wanStatusService.saveData({
        ...data,
        since: sinceDateString,  
      });

      return { message: 'Data saved successfully', data };
    } catch (error) {
      throw new HttpException(
        `Failed to save data: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Endpoint to get logs
  @Get()
  async getAllLogs(): Promise<any> {
    try {
      const logs = await this.wanStatusService.getLogs();
      return { message: 'Logs retrieved successfully', data: logs };
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve logs: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MikroTikService } from '../mikrotik/mikrotik.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Device } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class DevicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mikrotikService: MikroTikService,
  ) {}

  async getDevicesForUser(userId: number) {
    const userIdNumber = parseInt(userId.toString(), 10);

    const user = await this.prisma.user.findUnique({
      where: {
        id: userIdNumber,
      },
      select: {
        siteId: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const devices = await this.prisma.device.findMany({
      where: {
        siteId: user.siteId,
      },
    });

    return devices;
  }

  async findByAdminId(adminId: number) {
    try {
      const devices = await this.prisma.device.findMany({
        where: { adminId: adminId },
      });
      return devices;
    } catch (error) {
      console.error('Error fetching devices:', error);
      throw new BadRequestException('Failed to fetch devices');
    }
  }

  async findByManagerId(managerId: number) {
    try {
      const devices = await this.prisma.device.findMany({
        where: { managerId: managerId },
      });
      return devices;
    } catch (error) {
      console.error('Error fetching devices:', error);
      throw new BadRequestException('Failed to fetch devices');
    }
  }

  async countByManagerId(managerId: number) {
    try {
      const count = await this.prisma.device.count({
        where: { managerId },
      });
      return { managerId, count };
    } catch (error) {
      console.error(
        `Error counting devices for managerId ${managerId}:`,
        error,
      );
      throw new BadRequestException('Failed to fetch devices count');
    }
  }

  async findBySiteId(siteId: number) {
    try {
      const devices = await this.prisma.device.findMany({
        where: { siteId: siteId },
        include: {
          site: {
            select: {
              siteName: true,
            },
          },
        },
      });
      return devices;
    } catch (error) {
      console.error('Error fetching devices by siteId:', error);
      throw new BadRequestException(
        'Failed to fetch devices for the specified site',
      );
    }
  }

   // Count all devices
   async countAllDevices() {
    try {
      const count = await this.prisma.device.count();
      return { count };
    } catch (error) {
      console.error('Error fetching device count:', error);
      throw new BadRequestException('Failed to fetch device count');
    }
  }
  

  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    return this.prisma.device.create({
      data: {
        deviceId: createDeviceDto.deviceId,
        deviceName: createDeviceDto.deviceName,
        siteId: createDeviceDto.siteId,
        deviceType: createDeviceDto.deviceType,
        deviceIp: createDeviceDto.deviceIp,
        devicePort: createDeviceDto.devicePort,
        portCount: createDeviceDto.portCount,
        emailId: createDeviceDto.emailId,
        deviceUsername: createDeviceDto.deviceUsername,
        devicePassword: createDeviceDto.devicePassword,
        adminId: createDeviceDto.adminId,
        managerId: createDeviceDto.managerId,
      },
    });
  }

  async getDeviceById(deviceId: string): Promise<Device> {
    const device = await this.prisma.device.findUnique({
      where: { deviceId },
    });
    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }
    return device;
  }

  async fetchDeviceData(deviceId: string, endpoint: string) {
    const device = await this.getDeviceById(deviceId);
    const routerUrl = `http://${device.deviceIp}:${device.devicePort}`;
    const auth = {
      username: device.deviceUsername,
      password: device.devicePassword,
    };

    return this.mikrotikService.fetchEndpointData(routerUrl, auth, endpoint);
  }

 

  

  async fetchEndpointData(
    routerUrl: string,
    auth: { username: string; password: string },
    endpoint: string,
  ) {
    try {
      const authHeader = Buffer.from(
        `${auth.username}:${auth.password}`,
      ).toString('base64');
      const response = await axios.get(`${routerUrl}/rest/${endpoint}`, {
        headers: { Authorization: `Basic ${authHeader}` },
      });
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch data from ${endpoint}: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getNetwatchData(deviceId: string): Promise<any> {
    const device = await this.getDeviceById(deviceId);
    const routerUrl = `http://${device.deviceIp}:${device.devicePort}`;
    const auth = {
      username: device.deviceUsername,
      password: device.devicePassword,
    };

    return this.mikrotikService.fetchNetwatchData(routerUrl, auth);
  }

  async getWanIpAddress(
    deviceId: string,
    wanType: string,
  ): Promise<string | null> {
    const wanFetchMap = {
      WAN1: this.mikrotikService.fetchWan1IpAddress,
      WAN2: this.mikrotikService.fetchWan2IpAddress,
      WAN3: this.mikrotikService.fetchWan3IpAddress,
      WAN4: this.mikrotikService.fetchWan4IpAddress,
    };

    const fetchFunction = wanFetchMap[wanType];
    if (!fetchFunction) {
      throw new NotFoundException(`Invalid WAN type: ${wanType}`);
    }

    const device = await this.getDeviceById(deviceId);
    const routerUrl = `http://${device.deviceIp}:${device.devicePort}`;
    const auth = {
      username: device.deviceUsername,
      password: device.devicePassword,
    };

    return fetchFunction.call(this.mikrotikService, routerUrl, auth);
  }

  async categorizeDeviceByWanStatus(deviceId: string): Promise<string> {
    const device = await this.prisma.device.findUnique({
      where: { deviceId },
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    const wanStatuses = await Promise.all([
      this.mikrotikService.fetchWan1Status(device.deviceIp, {
        username: device.deviceUsername,
        password: device.devicePassword,
      }),
      this.mikrotikService.fetchWan2Status(device.deviceIp, {
        username: device.deviceUsername,
        password: device.devicePassword,
      }),
      this.mikrotikService.fetchWan3Status(device.deviceIp, {
        username: device.deviceUsername,
        password: device.devicePassword,
      }),
      this.mikrotikService.fetchWan4Status(device.deviceIp, {
        username: device.deviceUsername,
        password: device.devicePassword,
      }),
    ]);

    const activeWans = wanStatuses.filter((wan) => wan !== null).length;

    if (activeWans === wanStatuses.length) {
      return 'full working';
    } else if (activeWans > 0) {
      return 'partial working';
    } else {
      return 'no working';
    }
  }

  async findAll(): Promise<Device[]> {
    return this.prisma.device.findMany();
  }

  async findOne(deviceId: string): Promise<Device | null> {
    return this.prisma.device.findUnique({
      where: { deviceId },
    });
  }

  async update(id: number, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
    return this.prisma.device.update({
      where: { id },
      data: updateDeviceDto,
    });
  }

  async remove(id: number): Promise<{ message: string }> {
    const device = await this.prisma.device.findUnique({ where: { id } });
    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }

    await this.prisma.device.delete({ where: { id } });
    return { message: `Device with ID ${id} deleted successfully` };
  }
}

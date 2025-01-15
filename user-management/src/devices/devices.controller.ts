import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Device } from '@prisma/client';
import { MikroTikService } from 'src/mikrotik/mikrotik.service';

  @Controller('devices')
  export class DevicesController {
  constructor(
    private readonly devicesService: DevicesService,
    private readonly mikrotikService: MikroTikService,
  ) {}

  @Get('user/:userId')
async getDevices(@Param('userId') userId: string) {
  const userIdNumber = parseInt(userId, 10);  // Convert string to number
  return await this.devicesService.getDevicesForUser(userIdNumber);
}


  @Post()
  async create(@Body() createDeviceDto: CreateDeviceDto): Promise<Device> {
    return this.devicesService.create(createDeviceDto);
  }

  @Get()
  async findAll(@Query('adminId') adminId?: string, @Query('managerId') managerId?: string) {
    try {
      if (adminId) {
        const adminIdInt = parseInt(adminId, 10); 
        if (isNaN(adminIdInt)) {
          throw new BadRequestException('adminId must be a valid number');
        }
        return await this.devicesService.findByAdminId(adminIdInt); 
      }

      if (managerId) {
        const managerIdInt = parseInt(managerId, 10); 
        if (isNaN(managerIdInt)) {
          throw new BadRequestException('managerId must be a valid number');
        }
        return await this.devicesService.findByManagerId(managerIdInt); 
      }

      return await this.devicesService.findAll(); 
    } catch (error) {
      throw new BadRequestException('Failed to fetch devices');
    }
  }

  @Get('count')
  async getAllDeviceCount() {
    return this.devicesService.countAllDevices();
  }

  @Get('manager')
  async countByManagerId(@Query('managerId') managerId: string) {
    const managerIdNumber = parseInt(managerId, 10);
    if (isNaN(managerIdNumber)) {
      throw new BadRequestException('Invalid managerId');
    }
    return this.devicesService.countByManagerId(managerIdNumber);
  }

  @Get(':deviceId/data')
  async fetchDeviceData(@Param('deviceId') deviceId: string) {
    const device = await this.devicesService.getDeviceById(deviceId); 

    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    const routerUrl = `http://${device.deviceIp}:${device.devicePort}`;
    const auth = {
      username: device.deviceUsername,
      password: device.devicePassword,
    };                

    // Call the fetchAllData method to get all merged data
    return this.mikrotikService.fetchAllData(routerUrl, auth);
  }

  @Post('test/data')
  async testDevice(@Body() body: { username: string; password: string; port: string; ip: string }) {
    const { username, password, port, ip } = body;
  
    // Validate the input
    if (!username || !password || !port || !ip) {
      throw new BadRequestException('Missing required fields: username, password, ip, or port');
    }
  
    // Build the router URL
    const routerUrl = `http://${ip}:${port}`;
    const auth = { username, password };
  
    try {
      // Call the testData method to fetch data from the MikroTik router
      const data = await this.mikrotikService.testData(); // Ensure this method is called with 2 arguments
      return data; // Return the merged data from the MikroTik router
    } catch (error) {
      // Handle errors and send a response
      throw new BadRequestException('Failed to fetch data from the device');
    }
  }
  
  


  @Get('site/:siteId')
async findBySiteId(@Param('siteId') siteId: string) {
  try {
    const siteIdInt = parseInt(siteId, 10); 
    if (isNaN(siteIdInt)) {
      throw new BadRequestException('siteId must be a valid number');
    }
    return await this.devicesService.findBySiteId(siteIdInt); 
  } catch (error) {
    throw new BadRequestException('Failed to fetch devices for the specified site');
  }
}


  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Device | null> {
    return this.devicesService.findOne(id);
  }

  @Get(':deviceId/wan-ip')
  async getWanIp(@Param('deviceId') deviceId: string, @Query('wan') wan: 'WAN1' | 'WAN2') {
    if (!['WAN1', 'WAN2'].includes(wan)) {
      throw new NotFoundException(`Invalid WAN type: ${wan}`);
    }

    // Fetch all interfaces
    const interfaces = await this.devicesService.fetchDeviceData(deviceId, 'interface');
    
    // Find the interface based on the WAN type
    const wanInterface = interfaces.find((iface) => iface.comment === wan);

    if (!wanInterface) {
      throw new NotFoundException(`${wan} interface not found for device ${deviceId}`);
    }

    // Fetch the IP address for the found WAN interface
    return this.devicesService.fetchDeviceData(deviceId, `ip/address?interface=${wanInterface.name}`);
  }


  @Get(':deviceId/interface')
  async getDeviceInterfaces(@Param('deviceId') deviceId: string) {
    // Fetch all interfaces for the specified device
    const interfaces = await this.devicesService.fetchDeviceData(deviceId, 'interface');

    if (!interfaces || interfaces.length === 0) {
      throw new NotFoundException(`No interfaces found for device ${deviceId}`);
    }

    return interfaces;
  }

  @Get(':deviceId/tool/netwatch')
  async getNetwatch(@Param('deviceId') deviceId: string) {
    const device = await this.devicesService.getDeviceById(deviceId);
    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }
    return this.devicesService.getNetwatchData(deviceId); 
  }

  


  // Endpoint to get the device category based on WAN status
  @Get('status/:deviceId')
  async getDeviceStatus(@Param('deviceId') deviceId: string): Promise<string> {
    return this.devicesService.categorizeDeviceByWanStatus(deviceId);
  }


  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDeviceDto: UpdateDeviceDto
  ): Promise<Device> {
    return this.devicesService.update(id, updateDeviceDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.devicesService.remove(id);
  }
}

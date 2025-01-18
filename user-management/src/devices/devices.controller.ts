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
    const userIdNumber = parseInt(userId, 10); // Convert string to number
    const devices = await this.devicesService.getDevicesForUser(userIdNumber);
    return {
      count: devices.length, // Return the count of devices
      devices,              // Return the devices array (optional)
    };
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

 

  @Post('count/device')
  async testDevice(@Body() body: { username: string; password: string; ip: string; port: string }) {
    const { username, password, ip, port } = body;

    // Validate the input
    if (!username || !password || !ip || !port) {
      throw new BadRequestException('Missing required fields: username, password, ip, or port');
    }

    try {
      // Call the countDevice method with the necessary arguments
      const data = await this.mikrotikService.countDevice(username, password, ip, port);
      
      // Return the data with online, offline, and partial device counts
      return data;
    } catch (error) {
      // Handle errors and send a response
      throw new BadRequestException('Failed to fetch data from the device');
    }
  }

  @Post("fetch")
  async fetchData(@Body() body: { username: string; password: string; ip: string; port: string }) {
    const { username, password, ip, port } = body;
    const routerUrl = `http://${ip}:${port}`; // Construct the router URL dynamically using the IP and port from the request body.

    try {
      const data = await this.mikrotikService.fetchActiveData(routerUrl, { username, password });
      return data;
    } catch (error) {
      throw error; // Error is already handled in the service, but can be rethrown for custom handling here
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
  async getWanIp(@Param('deviceId') deviceId: string, @Query('wan') wan: 'WAN1' | 'WAN2' | 'WAN3' | 'WAN4') {
    if (!['WAN1', 'WAN2','WAN3','WAN4'].includes(wan)) {
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

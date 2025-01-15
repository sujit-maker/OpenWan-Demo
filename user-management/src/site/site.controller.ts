import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, Query } from '@nestjs/common';
import { SiteService } from './site.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';

@Controller('site')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}
  
  @Post()
  create(@Body() createSiteDto: CreateSiteDto) {
    return this.siteService.create(createSiteDto);
  }

  @Get('user/:userId')
  async getSites(@Param('userId') userId: number) {
    return await this.siteService.getSitesForUser(userId);
  }


  @Get('count')
  async getAllSiteCount() {
    return this.siteService.countAllSites();
  }

  @Get()
  async findAll(@Query('adminId') adminId?: string, @Query('managerId') managerId?: string) {
    try {
      if (adminId) {
        const adminIdInt = parseInt(adminId, 10); // Convert to integer
        if (isNaN(adminIdInt)) {
          throw new BadRequestException('adminId must be a valid number');
        }
        return await this.siteService.findByAdminId(adminIdInt); // Fetch sites for a specific admin
      }

      if (managerId) {
        const managerIdInt = parseInt(managerId, 10); // Convert to integer
        if (isNaN(managerIdInt)) {
          throw new BadRequestException('managerId must be a valid number');
        }
        return await this.siteService.findByManagerId(managerIdInt); // Fetch sites for a specific manager
      }

      return await this.siteService.findAll(); // No filters, fetch all sites
    } catch (error) {
      throw new BadRequestException('Failed to fetch sites');
    }
  }

  @Get('customer/:customerId')
  async findByCustomerId(@Param('customerId') customerId: string) {
    try {
      const customerIdInt = parseInt(customerId, 10); // Convert to integer
      if (isNaN(customerIdInt)) {
        throw new BadRequestException('customerId must be a valid number');
      }
      return await this.siteService.findByCustomerId(customerIdInt); // Fetch sites for the given customer
    } catch (error) {
      throw new BadRequestException('Failed to fetch sites for the specified customer');
    }
  }

  @Get('manager')
  async countByManagerId(@Query('managerId') managerId: string) {
    const managerIdNumber = parseInt(managerId, 10);
    if (isNaN(managerIdNumber)) {
      throw new BadRequestException('Invalid managerId');
    }
    return this.siteService.countByManagerId(managerIdNumber);
  }
  

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.siteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSiteDto: UpdateSiteDto) {
    return this.siteService.update(+id, updateSiteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.siteService.remove(+id);
  }
}

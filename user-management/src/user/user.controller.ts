import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  InternalServerErrorException,
  BadRequestException,
  Query,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthService } from 'src/auth/auth.service';
import { User } from './user.decorator';
import { Customer, Device, Site } from '@prisma/client';

export interface User {
  id: number;
  username: string;
  usertype: string;
  adminId: number;
  customerId:number;
  siteId:number;
}

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

   // Define the endpoint to fetch complete customer data by userId
@Get('customerName/:id')
async getCustomerByUserId(@Param('id') id: string): Promise<Customer> {
  const userId = parseInt(id, 10);

  // Validate userId
  if (isNaN(userId)) {
    throw new Error('Invalid user ID');
  }

  // Call the service to fetch the complete customer data
  return this.userService.getCustomerByUserId(userId);
}

// Route to count customers for multiple userIds
@Get('countCustomers')
async countCustomers(
  @Query('userIds') userIds: string, // Accepts a query parameter like ?userIds=1,2,3
): Promise<number> {
  // Parse and validate userIds (comma-separated string)
  const ids = userIds.split(',').map(id => parseInt(id, 10));

  if (ids.some(id => isNaN(id))) {
    throw new Error('Invalid user IDs');
  }

  // Call the service to count customers for the provided userIds
  return this.userService.countCustomersByUserIds(ids);
}


@Get('managerSites/:id')
async getSiteByManagerId(@Param('id') id: string): Promise<Site[]> {
  const managerId = parseInt(id, 10);

  // Validate managerId
  if (isNaN(managerId)) {
    throw new Error('Invalid Manager ID');
  }

  // Call the service to fetch the site for the manager
  return this.userService.getSitesByManagerId(managerId);
}




@Get('sitesByAdmin/:id')
async getSitesByAdminId(@Param('id') id: string): Promise<Site[]> {
  const adminId = parseInt(id, 10);

  // Validate adminId
  if (isNaN(adminId)) {
    throw new Error('Invalid admin ID');
  }

  // Fetch the sites based on adminId
  return this.userService.getSitesByAdmin(adminId);
}


 // Route to get the count of sites by managerId
 @Get('managerSitesCount/:id')
 async countSitesByManagerId(
   @Param('id', ParseIntPipe) id: number,  // Automatically parses and validates the id
 ): Promise<number> {
   // Call the service to fetch the site count for the manager
   return this.userService.countSitesByManagerId(id);
 }

 // Route to get the count of sites by adminId
 @Get('sitesByAdminCount/:id')
 async countSitesByAdminId(
   @Param('id', ParseIntPipe) id: number,  // Automatically parses and validates the id
 ): Promise<number> {
   // Call the service to fetch the site count for the admin
   return this.userService.countSitesByAdmin(id);
 }

@Get('managerDevices/:id')
async getDevicesByManagerId(@Param('id') id: string): Promise<Site[]> {
  const managerId = parseInt(id, 10);

  // Validate managerId
  if (isNaN(managerId)) {
    throw new Error('Invalid manager ID');
  }

  // Call the service to fetch sites
  return this.userService.getDevicesByManagerId(managerId);
}

@Get('devicesByCustomer/:id')
async getDevicesByCustomerId(@Param('id') id: string): Promise<Device[]> {
  const userId = parseInt(id, 10);

  if (isNaN(userId)) {
    throw new BadRequestException('Invalid User ID');
  }

  return this.userService.getDevicesByCustomerId(userId);
}



  @Get('count/admin/:adminId')
  async getUsersCount(@Param('adminId') adminId: string): Promise<number> {
    const parsedAdminId = parseInt(adminId, 10);

    if (isNaN(parsedAdminId)) {
      throw new HttpException('Invalid admin ID', HttpStatus.BAD_REQUEST);
    }

    return this.userService.getUserCountByAdminId(parsedAdminId);
  }


  @Get('counts')
  async getUserCounts() {
    return this.userService.getUserCounts();
  }

  @Get('managers')
  async findManagers() {
    try {
      return await this.userService.findManagers();
    } catch (error) {
      console.error('Error in findManagers controller:', error);
      throw new InternalServerErrorException('Failed to fetch managers.');
    }
  }

  @Get('admins')
  async findAdmins() {
    try {
      return await this.userService.findAdmins();
    } catch (error) {
      console.error('Error in findAdmins controller:', error);
      throw new InternalServerErrorException('Failed to fetch managers.');
    }
  }

  // Fetch admins based on managerId
  @Get('admins/manager')
  async findAdminsByManager(@Query('managerId') managerId: string) {
    const id = parseInt(managerId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('managerId must be a number');
    }
    try {
      return await this.userService.findAdminsByManagerId(id);
    } catch (error) {
      console.error('Error in findAdminsByManager controller:', error);
      throw new InternalServerErrorException('Failed to fetch admins by manager ID');
    }
  }

  @Get('managers/admin')
  async findManagersByAdmin(@Query('adminId') adminId: string) {
    const id = parseInt(adminId, 10);
    if (isNaN(id)) {
      throw new BadRequestException('adminId must be a number');
    }
    return this.userService.findManagersByAdminId(id);
  }

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @Get('all')
  async findAssociateUsersByAdmin(@User() user: any) {
    if (user.usertype !== 'ADMIN') {
      throw new UnauthorizedException(
        'You do not have permission to access this resource.',
      );
    }

    try {
      // Fetch the users associated with the logged-in admin
      const users = await this.userService.findUsersByAdminId(user.id);
      return users;
    } catch (error) {
      console.error('Error fetching users for admin:', error);
      throw new InternalServerErrorException(
        'Failed to fetch users for admin.',
      );
    }
  }

  @Get('ad')
  async getUsersByAdminId(@Query('adminId') adminId: string): Promise<User[]> {
    // Convert adminId to a number
    const parsedAdminId = parseInt(adminId, 10);
    if (isNaN(parsedAdminId)) {
      throw new BadRequestException('Invalid adminId');
    }
    return await this.userService.findUsersByAdminId(parsedAdminId) as User[];
    }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const idNumber = parseInt(id, 10);
    if (isNaN(idNumber)) {
      throw new BadRequestException('Invalid ID format');
    }
    try {
      return await this.userService.findOne(idNumber);
    } catch (error) {
      console.error('Error in findOne controller:', error);
      throw new InternalServerErrorException('Failed to fetch user.');
    }
  }

  @Post('register')
  async create(@Body() createUserDto: CreateUserDto) {
    const { managerId, adminId} = createUserDto;
  
    try {
      return await this.userService.createUser(
        createUserDto,
        managerId,
        adminId,
        
      );
    } catch (error) {
      console.error('Error creating user:', error);
      throw new InternalServerErrorException('Failed to create user');
    }
  }
  

 
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      return await this.userService.update(Number(id), updateUserDto);
    } catch (error) {
      console.error('Error updating user:', error);
      throw new InternalServerErrorException('Failed to update user.');
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      return await this.userService.remove(Number(id));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new InternalServerErrorException('Failed to delete user.');
    }
  }

  @Put(':id/change-password')
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    return this.authService.changePassword(
      userId,
      changePasswordDto.newPassword,
      changePasswordDto.confirmPassword,
    );
  }
}

import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Customer, Device, Site, UserType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

export interface User {
  id: number;
  username: string;
  usertype: string;
  adminId: number;
}

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getCustomerByUserId(adminId: number): Promise<Customer> {
    const user = await this.prisma.user.findUnique({
      where: { id: adminId },
      include: {
        customer: true, // Include the full customer data
      },
    });
  
    if (!user || !user.customer) {
      throw new Error('User or Customer not found');
    }
  
    // Return the complete customer data
    return user.customer;
  }

  async getSitesByManagerId(managerId: number): Promise<Site[]> {
    // Fetch the manager's details, including their customerId
    const manager = await this.prisma.user.findUnique({
      where: { id: managerId },
      include: { customer: true }, // Ensure customer relation is loaded
    });
  
    if (!manager || manager.usertype !== 'MANAGER' || !manager.customerId) {
      throw new Error('Invalid Manager ID or no associated customer');
    }
  
    // Fetch all sites associated with the manager's customerId
    const sites = await this.prisma.site.findMany({
      where: { customerId: manager.customerId },
    });
  
    if (!sites.length) {
      throw new Error('No sites found for the given manager');
    }
  
    return sites;
  }
  
  
  async getSitesByAdmin(adminId: number): Promise<Site[]> {
    // Step 1: Fetch the customerId associated with the given adminId
    const adminUser = await this.prisma.user.findUnique({
      where: { id: adminId },
      select: {
        customerId: true,
      },
    });
  
    // Check if adminUser exists and has a customerId
    if (!adminUser || !adminUser.customerId) {
      throw new Error('Admin user not found or does not have an associated customerId');
    }
  
    const customerId = adminUser.customerId;
  
    // Step 2: Fetch all sites associated with the retrieved customerId
    const sites = await this.prisma.site.findMany({
      where: { customerId },
    });
  
    // If no sites are found, return an empty array or throw an error based on your preference
    if (!sites || sites.length === 0) {
      throw new Error(`No sites found for customerId: ${customerId}`);
    }
  
    return sites;
  }
  
 
  























  async getDevicesByManagerId(managerId: number): Promise<Site[]> {
    // Ensure managerId is valid
    const manager = await this.prisma.user.findUnique({
      where: { id: managerId },
    });
  
    if (!manager || manager.usertype !== 'MANAGER') {
      throw new Error('Invalid Manager ID or no associated sites');
    }
  
    // Fetch sites associated with the managerId
    const sites = await this.prisma.site.findMany({
      where: { managerId },
    });
  
    if (sites.length === 0) {
      throw new Error('No sites found for the given manager');
    }
  
    return sites;
  }
  
  
  
  async getDevicesByAdmin(adminId: number): Promise<Device[]> {
    // Ensure adminId is valid
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });
  
    if (!admin || admin.usertype !== 'ADMIN') {
      throw new Error('Invalid Admin ID or no associated sites');
    }
  
    // Fetch devices from sites associated with the admin
    const devices = await this.prisma.device.findMany({
      where: {
        site: {
          adminId: adminId, // Check if the site's adminId matches
        },
      },
    });
  
    if (!devices.length) {
      throw new Error('No devices found for the given admin');
    }
  
    return devices;
  }
  
  
  


  async create(createUserDto: CreateUserDto) {
    const {
      username,
      password,
      usertype,
      emailId,
      customerId,
      siteId,
    } = createUserDto;

    // Check if username already exists
    const userExists = await this.prisma.user.findUnique({
      where: { username },
    });

    if (userExists) {
      throw new BadRequestException('Username already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        usertype,
        emailId,
        customerId,
        siteId,
      },
    });
    return user;
  }

  async createUser(
    createUserDto: CreateUserDto,
    managerId?: number,
    adminId?: number,
  ) {
    const { username, password, usertype, customerId, siteId,emailId } = createUserDto;

    // Check if username already exists
    const userExists = await this.prisma.user.findUnique({
      where: { username },
    });

    if (userExists) {
      throw new BadRequestException('Username already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare user data
    const userData: any = {
      username,
      password: hashedPassword,
      usertype,
      emailId,
      customerId,
      siteId,
    };

    // Connect the admin if the usertype is MANAGER and adminId is provided
    if (usertype === UserType.MANAGER && adminId) {
      userData.admin = { connect: { id: adminId } };
    }

    // Connect the manager for EXECUTIVE users (managerId is mandatory for EXECUTIVE)
    if (usertype === UserType.EXECUTIVE) {
      if (!managerId) {
        throw new BadRequestException(
          'managerId is required for EXECUTIVE user type',
        );
      }
      userData.manager = { connect: { id: managerId } };

      // Optionally connect admin if provided
      if (adminId) {
        userData.admin = { connect: { id: adminId } };
      }
    }

    // Create user
    const user = await this.prisma.user.create({
      data: userData,
    });
    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        usertype: true,
        emailId: true,
        managerId: true,

        adminId: true,
        deviceId: true,
      },
    });
  }

  // Fetch deviceId for a specific user
  async getDeviceIdForUser(id: string): Promise<{ deviceId: string }> {
    const userId = Number(id); // Convert the string to a number if needed

    // Fetch user by the correct identifier (id is a number now)
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId, // id is a number now
      },
      select: {
        deviceId: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return { deviceId: user.deviceId };
  }

  // Fetch admins associated with a managerId
  async findAdminsByManagerId(managerId: number) {
    // First, get the manager(s) associated with the given managerId
    const managers = await this.prisma.user.findMany({
      where: {
        id: managerId,
        usertype: UserType.MANAGER,
      },
      select: {
        id: true,
        adminId: true, // Fetch adminId associated with the manager
      },
    });

    if (managers.length === 0) {
      throw new NotFoundException(`No manager found with ID ${managerId}`);
    }

    // Extract the unique adminId(s) from the manager(s)
    const adminIds = managers.map((manager) => manager.adminId);

    // Fetch the admins who are associated with the adminId(s)
    const admins = await this.prisma.user.findMany({
      where: {
        id: { in: adminIds }, // Fetch users with adminId in the list
        usertype: UserType.ADMIN,
      },
      select: {
        id: true,
        username: true,
      },
    });

    return admins;
  }

  async findManagersByAdminId(adminId: number) {
    return this.prisma.user.findMany({
      where: {
        usertype: 'MANAGER',
        adminId: adminId,
      },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        usertype: true,
        emailId:true,
        managerId: true,
        adminId: true,
        deviceId: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findUsersByAdminId(adminId: number): Promise<User[]> {
    try {
      return await this.prisma.user.findMany({
        where: {
          adminId: adminId,
        },
        select: {
          id: true,
          username: true,
          usertype: true,
          adminId: true,
          managerId: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching users by admin ID',
      );
    }
  }

  async findManagers() {
    return this.prisma.user.findMany({
      where: { usertype: UserType.MANAGER },
      select: { id: true, username: true },
    });
  }

  async findAdmins() {
    return this.prisma.user.findMany({
      where: { usertype: UserType.ADMIN },
      select: { id: true, username: true },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const hashedPassword = updateUserDto.password
      ? await bcrypt.hash(updateUserDto.password, 10)
      : user.password;

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        username: updateUserDto.username ?? user.username,
        usertype: updateUserDto.usertype ?? user.usertype,
        password: hashedPassword,
        managerId: updateUserDto.managerId ?? user.managerId,
        adminId: updateUserDto.adminId ?? user.adminId,
      },
    });

    return updatedUser;
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check for associated users
    const associatedUsers = await this.prisma.user.findMany({
      where: { managerId: id },
    });

    if (associatedUsers.length > 0) {
      throw new BadRequestException(
        'This user cannot be deleted because it has associated users (executives).',
      );
    }

    await this.prisma.user.delete({ where: { id } });
    return { message: `User with ID ${id} deleted successfully` };
  }

  async login(username: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async changePassword(
    userId: number,
    newPassword: string,
    confirmPassword: string,
  ) {
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to update password');
    }

    return { message: 'Password updated successfully' };
  }

  async findExecutivesByManager(managerId: number) {
    const executives = await this.prisma.user.findMany({
      where: {
        managerId: managerId,
        usertype: UserType.EXECUTIVE,
      },
      select: {
        id: true,
        username: true,
        usertype: true,
        managerId: true,
      },
    });

    if (executives.length === 0) {
    }

    return executives;
  }

  async getUserCountByManagerId(managerId: number): Promise<number> {
    const count = await this.prisma.user.count({
      where: {
        managerId: managerId,
        usertype: 'EXECUTIVE',
      },
    });
    return count;
  }

  async getUserCountByAdminId(adminId: number): Promise<number> {
    const count = await this.prisma.user.count({
      where: {
        adminId: adminId,
        usertype: 'MANAGER',
      },
    });
    return count;
  }

  async getExecutiveCountByAdminId(adminId: number): Promise<number> {
    // Get the IDs of executives directly associated with the adminId
    const directExecutiveIds = await this.prisma.user.findMany({
      where: {
        adminId: adminId,
        usertype: 'EXECUTIVE',
      },
      select: { id: true },
    });

    // Fetch all manager IDs that are associated with the adminId
    const managers = await this.prisma.user.findMany({
      where: {
        adminId: adminId,
        usertype: 'MANAGER',
      },
      select: { id: true }, // Select only the ID of the managers
    });

    // Extract manager IDs into an array
    const managerIds = managers.map((manager) => manager.id);

    // Get the IDs of executives associated with the managers
    const executivesUnderManagersIds = await this.prisma.user.findMany({
      where: {
        managerId: { in: managerIds }, // Executives under these managers
        usertype: 'EXECUTIVE',
      },
      select: { id: true },
    });

    // Combine both sets of executive IDs and remove duplicates
    const allExecutiveIds = new Set([
      ...directExecutiveIds.map((e) => e.id),
      ...executivesUnderManagersIds.map((e) => e.id),
    ]);

    // Return the total count of unique executives
    return allExecutiveIds.size;
  }

  async getUserCounts() {
    try {
      const adminCount = await this.prisma.user.count({
        where: {
          usertype: UserType.ADMIN,
        },
      });

      const managerCount = await this.prisma.user.count({
        where: {
          usertype: UserType.MANAGER,
        },
      });

      const executiveCount = await this.prisma.user.count({
        where: {
          usertype: UserType.EXECUTIVE,
        },
      });

      return {
        admins: adminCount,
        managers: managerCount,
        executives: executiveCount,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to get user counts');
    }
  }
}

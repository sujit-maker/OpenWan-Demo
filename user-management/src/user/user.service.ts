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
  constructor(private prisma: PrismaService) { }

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


  // Count how many customers are fetched in a list of users (optional method)
  async countCustomersByUserIds(adminIds: number[]): Promise<number> {
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: adminIds },
      },
      include: {
        customer: true, // Include customers to count
      },
    });

    // Return the count of customers for these users
    const customerCount = users.filter(user => user.customer).length;

    return customerCount;
  }


  async getSitesByManagerId(managerId: number): Promise<Site[]> {
    // Fetch the manager's details, including their siteId
    const manager = await this.prisma.user.findUnique({
      where: { id: managerId },
      select: { siteId: true, usertype: true }, // Select only the necessary fields
    });

    if (!manager || manager.usertype !== 'MANAGER' || !manager.siteId) {
      throw new Error('Invalid Manager ID or no associated site ID');
    }

    // Fetch the site that matches the manager's siteId
    const site = await this.prisma.site.findUnique({
      where: { id: manager.siteId },
    });

    if (!site) {
      throw new Error('No site found for the given manager');
    }

    return [site]; // Returning as an array to maintain consistency
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

  // UserService

async countSitesByManagerId(managerId: number): Promise<number> {
  // Fetch the manager's details, including their siteId
  const manager = await this.prisma.user.findUnique({
    where: { id: managerId },
    select: { siteId: true, usertype: true }, // Select only the necessary fields
  });

  if (!manager || manager.usertype !== 'MANAGER' || !manager.siteId) {
    throw new Error('Invalid Manager ID or no associated site ID');
  }

  // Fetch the site that matches the manager's siteId
  const siteCount = await this.prisma.site.count({
    where: { id: manager.siteId },
  });

  // Return the count of sites
  return siteCount;
}

async countSitesByAdmin(adminId: number): Promise<number> {
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

  // Step 2: Count the number of sites associated with the retrieved customerId
  const siteCount = await this.prisma.site.count({
    where: { customerId },
  });

  // Return the count of sites
  return siteCount;
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

  async getDevicesByCustomerId(userId: number): Promise<Device[]> {
    // Fetch the user and ensure they are associated with a customer
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { customerId: true },
    });

    if (!user || !user.customerId) {
      throw new Error('User is not associated with a customer');
    }

    const customerId = user.customerId;

    // Get all sites linked to the customer
    const sites = await this.prisma.site.findMany({
      where: { customerId },
      select: { id: true },
    });

    if (sites.length === 0) {
      throw new Error('No sites found for the given customer');
    }

    // Extract site IDs
    const siteIds = sites.map((site) => site.id);

    // Get all devices linked to the sites
    const devices = await this.prisma.device.findMany({
      where: { siteId: { in: siteIds } },
    });

    return devices;
  }


  async create(createUserDto: CreateUserDto) {
    const {
      username,
      password,
      usertype,
      emailId,
      telegramId,
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
        telegramId,
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
    const { username, password, usertype, customerId, siteId, emailId,telegramId } = createUserDto;
  
    // Check if username already exists
    const userExists = await this.prisma.user.findUnique({
      where: { username },
    });
  
    if (userExists) {
      throw new BadRequestException('Username already exists');
    }
  
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
  
    // Prepare user data for User table
    const userData: any = {
      username,
      password: hashedPassword,
      usertype,
      adminId,
      managerId,
      customerId,
      siteId,
    };
  
    // Insert user into the User table
    const user = await this.prisma.user.create({
      data: userData,
    });
  
    // Update devices based on usertype
    if (usertype === 'ADMIN' && customerId) {
      // Fetch all sites associated with the customerId
      const sites = await this.prisma.site.findMany({
        where: { customerId },
        select: { id: true },
      });
  
      const siteIds = sites.map((site) => site.id);
  
      // Loop through all devices that belong to the fetched siteIds
      for (const siteId of siteIds) {
        const device = await this.prisma.device.findFirst({
          where: { siteId },
        });
  
        if (device) {
          // Ensure device.emailId is always an array
          const currentEmails = Array.isArray(device.emailId) ? device.emailId : [];

          const currentTelegramIds = Array.isArray(device.telegramId) ? device.telegramId : [];
  
          // Add the new email to the existing emailId array
          const updatedEmails = [...new Set([...currentEmails, emailId])]; 
          const updatedTelgramIds = [...new Set([...currentTelegramIds,telegramId])];
  
          await this.prisma.device.update({
            where: { deviceId: device.deviceId }, // Use deviceId (unique) for the update
            data: {
              emailId: updatedEmails, // Store the updated list of emails
              telegramId:updatedTelgramIds,
            },
          });
        }
      }
    } else if (usertype === 'MANAGER' && siteId) {
      // Get the device linked to the manager's siteId
      const device = await this.prisma.device.findFirst({
        where: { siteId },
      });
  
      if (device) {
        // Ensure device.emailId is always an array
        const currentEmails = Array.isArray(device.emailId) ? device.emailId : [];
        const currentTelegramIds = Array.isArray(device.telegramId) ? device.telegramId : [];

  
        // Add the new email to the existing emailId array
        const updatedEmails = [...new Set([...currentEmails, emailId])]; // Prevent duplicates
        const updatedTelgramIds = [...new Set([...currentTelegramIds,telegramId])];

        await this.prisma.device.update({
          where: { deviceId: device.deviceId }, // Use deviceId (unique) for the update
          data: {
            emailId: updatedEmails, // Store the updated list of emails
            telegramId:updatedTelgramIds,
          },
        });
      }
    }
  
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
        emailId: true,
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
        password: hashedPassword,
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

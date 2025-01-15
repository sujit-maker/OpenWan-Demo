import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';

@Injectable()
export class SiteService {
  constructor(private prisma: PrismaService) {}

  async getSitesForUser(userId: number) {  
    // Ensure that userId is a number
    const userIdNumber = parseInt(userId.toString(), 10);
    
    // Fetch the user to get the customerId associated with this user
    const user = await this.prisma.user.findUnique({
      where: {
        id: userIdNumber,  // Use the parsed number here
      },
      select: {
        customerId: true,
      },
    });
  
    if (!user) {
      throw new Error('User not found');
    }
  
    // Fetch the sites based on the customerId
    const sites = await this.prisma.site.findMany({
      where: {
        customerId: user.customerId,
      },
    });
  
    return sites;
  }
  

  async findByAdminId(adminId: number) {
    try {
      const sites = await this.prisma.site.findMany({
        where: { adminId: adminId },
        include: {
          customer: {
            select: {
              customerName: true, // Include customer name
            },
          },
        },
      });
      return sites;
    } catch (error) {
      console.error('Error fetching sites:', error); // Log any errors
      throw new BadRequestException('Failed to fetch sites');
    }
  }
  
  async findByManagerId(managerId: number) {
    try {
      const sites = await this.prisma.site.findMany({
        where: { managerId: managerId },
        include: {
          customer: {
            select: {
              customerName: true, // Include customer name
            },
          },
        },
      });
      return sites;
    } catch (error) {
      console.error('Error fetching sites:', error); // Log any errors
      throw new BadRequestException('Failed to fetch sites');
    }
  }

  async countByManagerId(managerId: number) {
    try {
      const count = await this.prisma.site.count({
        where: { managerId },
      });
      return { managerId, count };
    } catch (error) {
      console.error(`Error counting sites for managerId ${managerId}:`, error);
      throw new BadRequestException('Failed to fetch site count');
    }
  }

  async findByCustomerId(customerId: number) {
    try {
      const sites = await this.prisma.site.findMany({
        where: { customerId: customerId },
        include: {
          customer: {
            select: {
              customerName: true,  // Include customer name
            },
          },
        },
      });
      return sites;
    } catch (error) {
      console.error('Error fetching sites by customerId:', error); // Log any errors
      throw new BadRequestException('Failed to fetch sites for the specified customer');
    }
  }

   // Count all sites
   async countAllSites() {
    try {
      const count = await this.prisma.site.count();
      return { count };
    } catch (error) {
      console.error('Error fetching site count:', error);
      throw new BadRequestException('Failed to fetch site count');
    }
  }
  
  

  // Create a new Site
  async create(createSiteDto: CreateSiteDto) {
    const { customerId, siteName, siteAddress, contactName, contactNumber, contactEmail, adminId, managerId } = createSiteDto;
  
    // Ensure customerId is provided and valid
    if (!customerId) {
      throw new BadRequestException('customerId is required');
    }
  
    // Check if the customer exists
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });
  
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} does not exist.`);
    }
  
    return this.prisma.site.create({
      data: {
        customer: {
          connect: { id: customerId },
        },
        siteName,
        siteAddress,
        contactName,
        contactNumber,
        contactEmail,
        admin: adminId
          ? { connect: { id: adminId } }
          : undefined,  // Connect admin if provided
        manager: managerId
          ? { connect: { id: managerId } }
          : undefined,  // Connect manager if provided
      },
    });
  }
  

  async findAll() {
    return this.prisma.site.findMany({
      include: {
        customer: {
          select: {
            customerName: true,  
          },
        },
      },
    });
  }

  // Fetch a Specific Site by ID with Customer Name
  async findOne(id: number) {
    const site = await this.prisma.site.findUnique({
      where: {
        id: id  // Ensure you're passing the actual `id` here, not `Int`
      },
      include: {
        customer: {
          select: {
            customerName: true
          }
        }
      }
    });
  
    if (!site) {
      throw new NotFoundException(`Site with ID ${id} not found.`);
    }
  
    return site;
  }
  
  // Update a Site
  async update(id: number, updateSiteDto: UpdateSiteDto) {
    const { customerId, siteName, siteAddress, contactName, contactNumber, contactEmail, adminId, managerId } = updateSiteDto;
  
    if (customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
      });
  
      if (!customer) {
        throw new NotFoundException(`Customer with ID ${customerId} does not exist.`);
      }
    }
  
    return this.prisma.site.update({
      where: { id },
      data: {
        siteName,
        siteAddress,
        contactName,
        contactNumber,
        contactEmail,
        customer: customerId
          ? { connect: { id: customerId } }
          : undefined,
        admin: adminId
          ? { connect: { id: adminId } }
          : undefined,  // Connect admin if provided
        manager: managerId
          ? { connect: { id: managerId } }
          : undefined,  // Connect manager if provided
      },
    });
  }
  

  // Delete a Site
  async remove(id: number) {
    const site = await this.prisma.site.findUnique({
      where: { id },
      include: { tasks: true },  
    });
  
    if (!site) {
      throw new NotFoundException(`Site with ID ${id} does not exist.`);
    }
  
    if (site.tasks.length > 0) {
      await this.prisma.task.deleteMany({
        where: { siteId: id },
      });
    }
  
    return this.prisma.site.delete({
      where: { id },
    });
  }
  
}

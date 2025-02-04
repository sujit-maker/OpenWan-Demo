import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MikroTikService {

  constructor(private readonly prisma: PrismaService) {}

  
  private createAuthHeader(auth: { username: string; password: string }) {
    return `Basic ${Buffer.from(`${auth.username}:${auth.password}`).toString('base64')}`;
  }

  async fetchDeviceName(routerUrl: string, auth: { username: string; password: string }): Promise<string | null> {
    try {
      const authHeader = this.createAuthHeader(auth);
      const response = await axios.get(`${routerUrl}/rest/system/identity`, {
        headers: { Authorization: authHeader },
      });
      return response.data.name || null; 
    } catch (error) {
      console.error('Error fetching device name from system/identity:', error);
      throw new HttpException(
        `Failed to fetch device name: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Method to fetch all data from specified endpoints
  async fetchAllData(routerUrl: string, auth: { username: string; password: string }) {
    const endpoints = [
      'system/resource',
      'system/identity',
      'system/clock',
      'interface',
      'tool/netwatch',
      'ip/address',
      'ip/arp',
      'ppp/active',
    ];

    try {
      const authHeader = this.createAuthHeader(auth);
      const requests = endpoints.map(endpoint =>
        axios.get(`${routerUrl}/rest/${endpoint}`, { headers: { Authorization: authHeader } })
      );

      const responses = await Promise.all(requests);
      const mergedData = Object.fromEntries(responses.map((response, index) => [endpoints[index], response.data]));

      return mergedData;
    } catch (error) {
      console.error('Error fetching all data:', error);
      throw new HttpException(
        `Failed to fetch data from endpoints: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }



   // Method to fetch all data from specified endpoints
   async fetchActiveData(routerUrl: string, auth: { username: string; password: string }) {
    const endpoints = ['ppp/active'];

    try {
      const authHeader = this.createAuthHeader(auth);
      const requests = endpoints.map(endpoint =>
        axios.get(`${routerUrl}/rest/${endpoint}`, { headers: { Authorization: authHeader } })
      );

      const responses = await Promise.all(requests);
      const mergedData = Object.fromEntries(responses.map((response, index) => [endpoints[index], response.data]));

      return mergedData;
    } catch (error) {
      console.error('Error fetching all data:', error);
      throw new HttpException(
        `Failed to fetch data from endpoints: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }



 // Method to fetch active PPP users and match them with devices in the database
 async countDevice(username: string, password: string, ip: string, port: string) {
  const routerUrl = `http://${ip}:${port}`;
  const auth = { username, password };
  const endpoint = 'ppp/active';

  try {
    const authHeader = this.createAuthHeader(auth);

    // Fetch active PPP users
    let activeData = [];
    try {
      const response = await axios.get(`${routerUrl}/rest/${endpoint}`, {
        headers: { Authorization: authHeader },
      });
      activeData = response.data;
    } catch (error) {
      console.warn('Failed to fetch active PPP users:', error.message);
      activeData = []; // Proceed with an empty list to prevent function failure
    }

    // Fetch all devices & MikroTik statuses in one query each
    const [devices, mikrotikStatuses] = await Promise.all([
      this.prisma.device.findMany(),
      this.prisma.mikroTik.findMany(),
    ]);

    // Create a set of active device names
    const activeDeviceNames = new Set(activeData.map((user) => user.name));

    // Organize MikroTik statuses by device identity
    const mikrotikMap = new Map();
    for (const status of mikrotikStatuses) {
      if (!mikrotikMap.has(status.identity)) {
        mikrotikMap.set(status.identity, []);
      }
      mikrotikMap.get(status.identity).push(status);
    }

    let onlineDevices = [];
    let offlineDevices = [];
    let partialDevices = [];

    for (const device of devices) {
      if (activeDeviceNames.has(device.deviceId)) {
        // Device is online, check MikroTik status
        const mikrotikDeviceStatuses = mikrotikMap.get(device.deviceName) || [];

        if (mikrotikDeviceStatuses.length > 0) {
          // Determine latest status for each WAN
          const latestStatusByComment = mikrotikDeviceStatuses.reduce((acc, { comment, status, createdAt }) => {
            if (!acc[comment] || new Date(createdAt) > new Date(acc[comment].createdAt)) {
              acc[comment] = { status, createdAt };
            }
            return acc;
          }, {} as { [key: string]: { status: string; createdAt: Date } });

          // If any WAN is down, mark as partial
          const isPartial = ['WAN1', 'WAN2', 'WAN3', 'WAN4'].some(
            (wan) => latestStatusByComment[wan]?.status === 'down'
          );

          if (isPartial) {
            partialDevices.push({ deviceId: device.deviceId, deviceName: device.deviceName });
          } else {
            onlineDevices.push({ deviceId: device.deviceId, deviceName: device.deviceName });
          }
        } else {
          offlineDevices.push({ deviceId: device.deviceId, deviceName: device.deviceName }); // No MikroTik record found
        }
      } else {
        offlineDevices.push({ deviceId: device.deviceId, deviceName: device.deviceName }); // Device is not active
      }
    }

    return {
      onlineDevices,
      offlineDevices,
      partialDevices,
    };
  } catch (error) {
    console.error('Error fetching active devices:', error);
    throw new HttpException(
      `Failed to fetch active devices or match with the database: ${error.message}`,
      HttpStatus.BAD_REQUEST
    );
  }
}




  // Method to fetch data from a specific endpoint
  async fetchEndpointData(routerUrl: string, auth: { username: string; password: string }, endpoint: string) {
    try {
      const authHeader = this.createAuthHeader(auth);
      const response = await axios.get(`${routerUrl}/rest/${endpoint}`, {
        headers: { Authorization: authHeader },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from ${endpoint}:`, error);
      throw new HttpException(
        `Failed to fetch data from ${endpoint}: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Method to fetch netwatch data
  async fetchNetwatchData(routerUrl: string, auth: { username: string; password: string }): Promise<any[]> {
    try {
      const netwatchResponse = await axios.get(`${routerUrl}/rest/tool/netwatch`, {
        headers: {
          Authorization: this.createAuthHeader(auth),
        },
      });
      return netwatchResponse.data;
    } catch (error) {
      console.error('Error fetching netwatch data:', error);
      throw new HttpException(
        `Failed to fetch netwatch data: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  //  method to fetch WAN IP address by comment
  async fetchWanIpAddressByComment(routerUrl: string, auth: { username: string; password: string }, comment: string): Promise<string | null> {
    try {
      const interfaceResponse = await axios.get(`${routerUrl}/rest/interface?comment=${comment}`, {
        headers: { Authorization: this.createAuthHeader(auth) },
      });

      const interfaces = interfaceResponse.data;
      if (interfaces.length === 0) {
        console.log(`Interface with comment '${comment}' not found.`);
        return null;
      }

      const wanInterfaceName = interfaces[0].name;
      const ipResponse = await axios.get(`${routerUrl}/rest/ip/address?interface=${wanInterfaceName}`, {
        headers: { Authorization: this.createAuthHeader(auth) },
      });

      const ipAddresses = ipResponse.data;
      return ipAddresses[0]?.address || null;
    } catch (error) {
      console.error(`Error fetching ${comment} IP address:`, error);
      return null;
    }
  }


  async fetchInterfaceStatus(deviceIp: string, credentials: { username: string, password: string }): Promise<any[]> {
    // This is a simplified example. You would need to use the MikroTik API or SSH client to fetch the data.
    const response = await fetch(`http://122.169.108.252:8000/devices/${deviceIp}/interface`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch interface status');
    }
    return response.json(); // This should return an array of interface statuses
  }
  

  // Method to fetch WAN1 IP address
  async fetchWan1IpAddress(routerUrl: string, auth: { username: string; password: string }): Promise<string | null> {
    return this.fetchWanIpAddressByComment(routerUrl, auth, 'WAN1');
  }

  // Method to fetch WAN2 IP address
  async fetchWan2IpAddress(routerUrl: string, auth: { username: string; password: string }): Promise<string | null> {
    return this.fetchWanIpAddressByComment(routerUrl, auth, 'WAN2');
  }
  
   // Method to fetch WAN3 IP address
   async fetchWan3IpAddress(routerUrl: string, auth: { username: string; password: string }): Promise<string | null> {
    return this.fetchWanIpAddressByComment(routerUrl, auth, 'WAN3');
  }

   // Method to fetch WAN4 IP address
   async fetchWan4IpAddress(routerUrl: string, auth: { username: string; password: string }): Promise<string | null> {
    return this.fetchWanIpAddressByComment(routerUrl, auth, 'WAN4');
  }



  // Method to check if a given WAN interface is running (connected to the internet)
  async isWanInterfaceRunning(routerUrl: string, auth: { username: string; password: string }, wanComment: string): Promise<boolean> {
    try {
      const interfaces = await this.fetchInterfaceStatus(routerUrl, auth);
      const wanInterface = interfaces.find((iface) => iface.comment === wanComment);
      
      if (!wanInterface) {
        console.log(`WAN interface with comment '${wanComment}' not found.`);
        return false;
      }

      return wanInterface.running === true; // Returns true if the interface is running (connected)
    } catch (error) {
      console.error(`Error checking if ${wanComment} is running:`, error);
      return false;
    }
  }



    // Method to fetch WAN1 IP address and check if it's running
    async fetchWan1Status(routerUrl: string, auth: { username: string; password: string }): Promise<string | null> {
      const isRunning = await this.isWanInterfaceRunning(routerUrl, auth, 'WAN1');
      if (isRunning) {
        return this.fetchWanIpAddressByComment(routerUrl, auth, 'WAN1');
      }
      return null;
    }
  
    // Method to fetch WAN2 IP address and check if it's running
    async fetchWan2Status(routerUrl: string, auth: { username: string; password: string }): Promise<string | null> {
      const isRunning = await this.isWanInterfaceRunning(routerUrl, auth, 'WAN2');
      if (isRunning) {
        return this.fetchWanIpAddressByComment(routerUrl, auth, 'WAN2');
      }
      return null;
    }
  
    // Method to fetch WAN3 IP address and check if it's running
    async fetchWan3Status(routerUrl: string, auth: { username: string; password: string }): Promise<string | null> {
      const isRunning = await this.isWanInterfaceRunning(routerUrl, auth, 'WAN3');
      if (isRunning) {
        return this.fetchWanIpAddressByComment(routerUrl, auth, 'WAN3');
      }
      return null;
    }
  
    // Method to fetch WAN4 IP address and check if it's running
    async fetchWan4Status(routerUrl: string, auth: { username: string; password: string }): Promise<string | null> {
      const isRunning = await this.isWanInterfaceRunning(routerUrl, auth, 'WAN4');
      if (isRunning) {
        return this.fetchWanIpAddressByComment(routerUrl, auth, 'WAN4');
      }
      return null;
    }
}

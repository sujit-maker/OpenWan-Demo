import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MikroTikService {

  constructor(private readonly prisma: PrismaService) {}


  private readonly defaultConfig = {
    username: 'admin',
    password: 'Enpl@253000',
    ip: 'opw1.openwan.in',
    port: '91',
  };
  
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

 // Method to fetch active PPP users and match them with devices in the database
 async countDevice(username: string, password: string, ip: string, port: string) {
  const routerUrl = `http://${ip}:${port}`;
  const auth = { username, password };
  const endpoints = ['ppp/active'];

  try {
    const authHeader = this.createAuthHeader(auth);

    // Fetch data from MikroTik's 'ppp/active' endpoint
    const requests = endpoints.map((endpoint) =>
      axios.get(`${routerUrl}/rest/${endpoint}`, { headers: { Authorization: authHeader } })
    );

    const responses = await Promise.all(requests);
    const activeData = responses[0].data; // Assuming we only need data from 'ppp/active'

    // Fetch all devices from the database
    const devices = await this.prisma.device.findMany();

    // Create a set of active device names (ppp/active names)
    const activeDeviceNames = new Set(activeData.map((user) => user.name));

    // Count the online, offline, and partial devices
    let onlineCount = 0;
    let offlineCount = 0;
    let partialCount = 0;

    // Iterate over each device in the database
    for (const device of devices) {
      if (activeDeviceNames.has(device.deviceId)) {
        // Device is online, check the MikroTik status
        const mikrotikDevice = await this.prisma.mikroTik.findMany({
          where: { identity: device.deviceName }, // Assuming deviceName is the correct field
        });

        if (mikrotikDevice.length > 0) {
          let isPartial = false;

          // Create a map to hold the latest status of each comment (WAN)
          const latestStatusByComment: { [key: string]: { status: string, createdAt: Date } } = {};

          // Iterate through each MikroTik status and find the latest status per comment
          for (const deviceStatus of mikrotikDevice) {
            const { comment, status, createdAt } = deviceStatus;

            // Parse createdAt to a Date object for comparison
            const createdAtDate = new Date(createdAt);

            // If there's no status for this comment or the current entry is more recent, update it
            if (
              !latestStatusByComment[comment] ||
              createdAtDate > latestStatusByComment[comment].createdAt
            ) {
              latestStatusByComment[comment] = { status, createdAt: createdAtDate };
            }
          }

          // Check the most recent status of each WAN (WAN1, WAN2, etc.)
          for (const comment of ['WAN1', 'WAN2', 'WAN3', 'WAN4']) {
            if (latestStatusByComment[comment]?.status === 'down') {
              isPartial = true; // If any WAN is down, mark as partial
              break;
            }
          }

          if (isPartial) {
            partialCount += 1; // Increment partial count if any WAN is down
          } else {
            onlineCount += 1; // Device is fully online if no WAN is down
          }
        } else {
          offlineCount += 1; // Device is online but no MikroTik record found (fallback)
        }
      } else {
        offlineCount += 1; // Device is offline
      }
    }

    // Return the count of online, offline, and partial devices
    return {
      onlineDevices: onlineCount,
      offlineDevices: offlineCount,
      partialDevices: partialCount,
    };
  } catch (error) {
    console.error('Error fetching active devices:', error);
    throw new HttpException(
      `Failed to fetch active devices or match with the database: ${error.message}`,
      HttpStatus.BAD_REQUEST,
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
    const response = await fetch(`http://localhost:8000/devices/${deviceIp}/interface`, {
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

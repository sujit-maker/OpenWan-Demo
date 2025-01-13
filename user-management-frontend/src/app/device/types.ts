
export interface Device {
    site: any;
    id: number;
    deviceId: string; 
    deviceName: string;
    adminId:number;
    managerId:number;
    siteId : number;
    deviceType: string;
    deviceIp: string;
    devicePort: string;
    portCount :string;
    emailId:string;
    deviceUsername: string;
    devicePassword: string;
  }
  export interface Site {
    id: number;
    siteName: string; 
  }
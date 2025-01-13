// src/types.ts
export interface Customer {
    id: number;
    customerName: string; // Ensure this matches your data
  }
  
  export interface Site {
    id: number;
    siteName: string;
    customerId: number;
    customer: Customer;
    siteAddress: string;
    contactName: string;
    contactNumber: string;
    contactEmail: string;
    adminId:number;
      managerId:number;
  }
  
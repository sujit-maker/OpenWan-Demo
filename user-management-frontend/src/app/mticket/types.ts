// src/ticket/types.ts
export interface Ticket {
    id: number;
    ticketNo: string;
    category: string;
    subject: string;
    query: string;
    userId : number;
    status:string;
    remark:string
}

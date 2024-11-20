export interface Customer {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  orderCount?: number;
  loyaltyPoints?: number;
  addedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

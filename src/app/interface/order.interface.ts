import { Customer } from "./customer.interface";
import { Menu } from "./menu.interface";

export interface Order {
  orderId?: string;
  user?: string;
  customer: Customer;
  items: {
    menuItem: Menu;
    quantity: number;
    price: number;
    customization: string;
    addOns?: {
      name: string;
      price: number;
    }[];
  }[];
  subTotal?: number;
  totalPrice?: number;
  tax?: number;
  orderStatus: 'pending' | 'preparing' | 'completed' | 'cancelled';
  createdAt?: Date;
  _id?: string;
}

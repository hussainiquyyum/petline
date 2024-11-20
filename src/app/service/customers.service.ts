import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Customer } from '../interface/customer.interface';

const BASE_URL = `${environment.apiUrl}/customers`;

@Injectable({
  providedIn: 'root'
})
export class CustomersService {
  private _http = inject(HttpClient);  
  constructor() { }

  getCustomerById(id: string) {
    return this._http.get<Customer>(`${BASE_URL}/${id}`);
  }

  editCustomer(id: string, customer: Customer) {
    return this._http.put<Customer>(`${BASE_URL}/${id}`, customer);
  }

}

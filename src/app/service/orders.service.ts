import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Order } from '../interface/order.interface';
import { Observable } from 'rxjs';

const BASE_URL = `${environment.apiUrl}/orders/customer`;

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
    private _http = inject(HttpClient);

    constructor() { }

    getAllOrders() {
        return this._http.get<Order[]>(BASE_URL);
    }

    submitOrder(order: Order) {
        return this._http.post<Order>(BASE_URL, order);
    }

    getOrderById(id: string) {
        return this._http.get<Order>(`${BASE_URL}/${id}`);
    }

    updateOrder(id: string, order: Order) {
        return this._http.put<Order>(`${BASE_URL}/${id}`, order);
    }

    updateOrderStatus(id: string, orderStatus: string) {
        return this._http.put<Order>(`${BASE_URL}/${id}/updateStatus`, { orderStatus });
    }

    deleteOrder(id: string) {
        return this._http.delete<Order>(`${BASE_URL}/${id}`);
    }

    getPendingOrders(): Observable<Order[]> {
        return this._http.get<Order[]>(`${BASE_URL}/all/pending`);
    }

}


import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { User } from '../interface/user.interface';

const API_URL = `${environment.apiUrl}/users`;

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);

  constructor() { }

  getUser() {
    return this.http.get(`${API_URL}/profile`);
  }

  updateUser(user: User) {
    return this.http.put(`${API_URL}/name`, user);
  }
}

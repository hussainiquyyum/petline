import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, interval, Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

const BASE_URL = `${environment.apiUrl}/auth`;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router); 
  private accessToken = new BehaviorSubject<string | null>(null);
  public checkLogin = signal(false);

  constructor() {
    this.isLoggedIn();
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('accessToken') ? true : false;
    if (token) {
      // this.router.navigate(['/home']);
      interval(14 * 60 * 1000).subscribe(() => this.refreshAccessToken().subscribe());
    }
    this.checkLogin.set(token);
    return token;
  }
  
  customerGetOtp(mobile: string): Observable<any> {
    return this.http.post<any>(`${BASE_URL}/login`, { phone: mobile });
  }

  customerLogin(mobile: string, mobileOtp: string): Observable<any> {
    return this.http.post<any>(`${BASE_URL}/verify-otp`, { phone: mobile, otp: mobileOtp }, { withCredentials: true }).pipe(
      tap(response => {
        this.accessToken.next(response.accessToken);
        localStorage.setItem('accessToken', response.accessToken); // Optional: store in local storage for app reloads
      })
    );
  }

  getAccessToken(): Observable<string | null> {
    return of(localStorage.getItem('accessToken')); // retrieve token from local storage
  }
  
  // login(email: string, password: string): Observable<any> {
  //   return this.http.post<any>(`${BASE_URL}/login`, { email, password }, { withCredentials: true });
  // }

  register(user: any): Observable<any> {
    return this.http.post<any>(`${BASE_URL}/register`, user, { withCredentials: true });
  }

  refreshAccessToken(): Observable<{accessToken: string} | null> {
    return this.http.post<{ accessToken: string }>(`${BASE_URL}/refresh-token`, {}, { withCredentials: true }).pipe(
      tap(response => {
        this.accessToken.next(response.accessToken);
        localStorage.setItem('accessToken', response.accessToken); // Optional
      }),
      catchError((error: any) => {
        this.accessToken.next(null);
        localStorage.removeItem('accessToken');
        this.logout().subscribe();
        return of(null);
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${BASE_URL}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.accessToken.next(null);
        localStorage.removeItem('accessToken');
        this.router.navigate(['/login']);
        this.isLoggedIn();
      })
    );
  }

  refreshToken(): Observable<any> {
    return this.http.post<any>(`${BASE_URL}/refresh-token`, {}, { withCredentials: true });
  }

  getMyInfo(): Observable<any> {
    return this.http.get<any>(`${BASE_URL}/myinfo`,);
  }

  isAuthenticated(): boolean {
    // Implement your logic to check if the user is authenticated
    return !!localStorage.getItem('token');
  }
}

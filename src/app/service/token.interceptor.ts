import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.authService.getAccessToken().pipe(
      switchMap(token => {
        // Clone the request to add the access token in the header
        console.log('token', token);
        const clonedRequest = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
        
        return next.handle(clonedRequest).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
              // Attempt to refresh the token if the access token has expired
              return this.authService.refreshAccessToken().pipe(
                switchMap(newToken => {
                  // Retry the failed request with the new token
                  const retryRequest = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
                  return next.handle(retryRequest);
                }),
                catchError(refreshError => {
                  // If refreshing also fails, log the user out
                  this.authService.logout().subscribe();
                  return throwError(refreshError);
                })
              );
            }
            return throwError(error);
          })
        );
      })
    );
  }
}
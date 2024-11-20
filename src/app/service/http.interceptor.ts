import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private authService = inject(AuthService);
  private router = inject(Router);
  private _modalService = inject(NgbModal);

  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // const token = localStorage.getItem('accessToken');
    return this.authService.getAccessToken().pipe(
      switchMap(token => {

    let authReq = req;
    if (token) {
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expired, attempt to refresh it
          return this.authService.refreshToken().pipe(
            switchMap((newToken: any) => {
              localStorage.setItem('accessToken', newToken.accessToken);
              const clonedReq = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${newToken.accessToken}`)
              });
              return next.handle(clonedReq);
            }),
            catchError((refreshError) => {
              // If refresh also fails, logout the user or handle accordingly
              this.authService.logout();
              return throwError(refreshError);
            })
          );
        } else if (error.status === 403) {
          localStorage.clear();
          this._modalService.dismissAll();
          this.router.navigate(['/login']);
          return throwError(error);
        } else {
          return throwError(error);
        }
          })
        );
      })
    );
  }
}


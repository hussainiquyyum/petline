import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomePage }  from './pages/home/home';
import { PosCustomerOrderPage } from './pages/pos/customer-order/pos-customer-order';
import { AuthGuard } from './service/auth.guard';
import { ErrorPage } from './pages/page/error/page-error';
import { LoginPage } from './auth/login/page-login';
import { RegisterPage } from './auth/register/page-register';
import { CartComponent } from './pages/cart/cart.component';
import { SettingsPage } from './pages/settings/settings';
import { OtpComponent } from './auth/otp/otp.component';
import { ProductDetailsPage } from './pages/product-details/page-product-details';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  
  // { path: 'home', component: HomePage, data: { title: 'Home'} },

  { path: 'login', component: LoginPage, data: { title: 'Login'} },
  { path: 'register', component: RegisterPage, data: { title: 'Register'} },
  { path: 'otp', component: OtpComponent, data: { title: 'OTP'} },
  { path: 'add-new', component: ProductDetailsPage, data: { title: 'Add New'}, canActivate: [AuthGuard] },
  { path: 'home', component: PosCustomerOrderPage, data: { title: 'Customer Order'} },
  { path: 'cart', component: CartComponent, data: { title: 'Cart'}, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsPage, data: { title: 'Settings'}, canActivate: [AuthGuard] },
  { path: '**', pathMatch: 'full', redirectTo: '/login' }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ],
  declarations: []
})


export class AppRoutingModule { }

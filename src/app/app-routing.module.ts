import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomePage }  from './pages/home/home';
import { ListPage } from './pages/list/list.component';
import { AuthGuard } from './service/auth.guard';
import { ErrorPage } from './pages/page/error/page-error';
import { LoginPage } from './auth/login/page-login';
import { RegisterPage } from './auth/register/page-register';
import { CartComponent } from './pages/cart/cart.component';
import { SettingsPage } from './pages/settings/settings';
import { OtpComponent } from './auth/otp/otp.component';
import { NewListingPage } from './pages/new-listing/new-listing.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  
  // { path: 'home', component: HomePage, data: { title: 'Home'} },

  { path: 'login', component: LoginPage, data: { title: 'Login'} },
  { path: 'register', component: RegisterPage, data: { title: 'Register'} },
  { path: 'otp', component: OtpComponent, data: { title: 'OTP'} },
  { path: 'add-new', component: NewListingPage, data: { title: 'Add New'}, canActivate: [AuthGuard] },
  { path: 'edit-pet/:id', component: NewListingPage, data: { title: 'Edit Pet'}, canActivate: [AuthGuard] },
  { path: 'home', component: ListPage, data: { title: 'List'} },
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

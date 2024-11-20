import { Component, inject } from '@angular/core';
import { AppSettings } from '../../service/app-settings.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  private appSettings = inject(AppSettings);
  constructor() {
    this.appSettings.appHeaderNone = false;
    this.appSettings.appSidebarNone = true;
    this.appSettings.appContentClass = 'p-1 ps-xl-4 pe-xl-4 pt-xl-3 pb-xl-3';
    this.appSettings.appContentFullHeight = true;
  }

}

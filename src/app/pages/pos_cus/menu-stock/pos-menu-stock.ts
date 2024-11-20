import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from '../../../service/app-settings.service';
import { MenuService } from '../../../service/menu.service';
import { Subject, takeUntil } from 'rxjs';
import { Category, Menu } from '../../../interface/menu.interface';

@Component({
  selector: 'pos-menu-stock',
  templateUrl: './pos-menu-stock.html'
})

export class PosMenuStockPage implements OnInit, OnDestroy {
	public menu: Menu[] = [];
  public isAddMenu: boolean = false;
  public menuItem!: Menu;
  private _menuService = inject(MenuService);
  private _appSettings = inject(AppSettings);
  private _http = inject(HttpClient);
  private endSubs = new Subject<void>();

	constructor() {
    this._appSettings.appHeaderNone = true;
    this._appSettings.appSidebarNone = true;
    this._appSettings.appContentClass = 'p-1 ps-xl-4 pe-xl-4 pt-xl-3 pb-xl-3';
    this._appSettings.appContentFullHeight = true;
  }
	
	ngOnInit() {
		// this._http.get('/assets/data/pos-menu-stock/data.json', { responseType: 'json' }).pipe(takeUntil(this.endSubs)).subscribe((response) => {
		// 	this.menu = response;
		// });
    this.menuItem = {
      name: '',
      description: '',
      price: 0,
      isAvailable: true,
      category: {
        name: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      addedBy: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this._getMenuList();
  }

  uploadImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);

      this._http.post('/api/upload', formData).pipe(takeUntil(this.endSubs)).subscribe({
        next: (response) => {
          console.log('Image uploaded successfully', response);
        },
        error: (error) => {
          console.error('Error uploading image', error);
        }
      });
    }
  }

  addMenu() {
    this.isAddMenu = !this.isAddMenu;
    console.log(this.isAddMenu);
  }

  onSaveMenu() {
    this._menuService.addMenuItem(this.menuItem).pipe(takeUntil(this.endSubs)).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error) => {
        console.error('Error adding menu item', error);
      }
    });
  }

  closeAddMenu() {
    this.isAddMenu = false;
  }

  private _getMenuList() {
    this._menuService.getMenulist().pipe(takeUntil(this.endSubs)).subscribe({
      next: (response) => {
        console.log(response);
        if(response.length===0) {
          this.addMenu();
          console.log(this.isAddMenu);
          
        }
        this.menu = response;
        console.log(this.menu);
      },
      error: (error) => {
        console.error('Error getting menu list', error);
      }
    });
  }

  ngOnDestroy() {
    this.endSubs.next();
    this.endSubs.complete();
    this._appSettings.appHeaderNone = false;
    this._appSettings.appSidebarNone = false;
    this._appSettings.appContentClass = '';
    this._appSettings.appContentFullHeight = false;
  }
}

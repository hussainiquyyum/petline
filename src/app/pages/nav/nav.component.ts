import { Component, inject, signal } from '@angular/core';

import { NavBtn } from '../../interface/menu.interface';
import { AuthService } from '../../service/auth.service';
import { NavigationEnd, Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-nav',
    templateUrl: './nav.component.html',
    styleUrl: './nav.component.scss',
    standalone: false
})
export class NavComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  navBtn = signal<NavBtn[]>([]);
	mobileSidebarToggled: boolean = false;

  constructor() {
    this.setNavBtn();
  }

  navClick(index: number) {
    if (this.navBtn()[index].action) {
      this.navBtn()[index].action?.();
    } else {
      this.router.navigate([this.navBtn()[index].route]);
      this.navBtn().forEach(navBtn => navBtn.active = false);
      this.navBtn()[index].active = true;
    }
  }

  showType(event: Event, type: string) {
		event.preventDefault();
		
		for (var i = 0; i < this.navBtn().length; i++) {
			if (this.navBtn()[i].name == type) {
				this.navBtn()[i].active = true;
			} else {
				this.navBtn()[i].active = false;
			}
		}
	}

  private setNavBtn() {
    this.navBtn.set([
      {
        name: 'Home',
        icon: 'bi bi-house',
        active: true,
        route: '/home'
      },
      {
        name: 'Add New',
        icon: 'bi bi-plus-circle',
        active: false,
        route: '/add-new'
      },
      // {
      //   name: 'Log Out',
      //   icon: 'bi bi-box-arrow-right',
      //   active: false,
      //   route: '',
      //   action: () => {
      //     localStorage.removeItem('token');
      //     this.router.navigate(['/login']);
      //   }
      // },
      // {
      //   name: 'You',
      //   icon: 'bi bi-person',
      //   active: false,
      //   route: '/account'
      // },
      {
        name: 'Settings',
        icon: 'bi bi-gear',
        active: false,
        route: '/settings'
      }
    ]);
    this.router.events.subscribe((route: any) => {
      this.navBtn().forEach(navBtn => {
        if (navBtn.route?.includes(this.router.url)) {
          navBtn.active = true;
        } else {
          navBtn.active = false;
        }
      });
    });
  }
}

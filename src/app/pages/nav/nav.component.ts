import { Component, inject, Input, computed, signal, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../service/auth.service';
import { NavBtn } from '../../interface/menu.interface';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MoreNavComponent } from '../../shared/component/more-nav/more-nav.component';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  standalone: false
})
export class NavComponent implements OnInit {
  activeTab: string = 'home';
  isLoggedIn = signal<boolean>(false);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  public navBtn = signal<NavBtn[]>([]);
  public mobileSidebarToggled: boolean = false;
  private bottomSheet = inject(MatBottomSheet);
  
  ngOnInit() {
    // Set initial active tab based on current route
    this.activeTab = this.getTabFromUrl(this.router.url);
    this.setNavRoute();

    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.activeTab = this.getTabFromUrl(this.router.url);
    });
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

  private setNavRoute() {
    this.router.events.subscribe((route: any) => {
      this.isLoggedIn.set(this.authService.isLoggedIn());
      this.setNavBtn();
      this.navBtn().forEach(navBtn => {
        if (navBtn.route?.includes(this.router.url)) {
          navBtn.active = true;
        } else {
          navBtn.active = false;
        }
      });
    });
  }
  private setNavBtn() {
    if (this.isLoggedIn()) {
      this.navBtn.set([
        {
          name: 'Store',
          icon: 'bi bi-bag',
          active: false,
          route: '/store'
        },
        // {
        //   name: 'Wishlist',
        //   icon: 'bi bi-heart',
        //   active: false,
        //   route: '/wishlist'
        // },
        {
          name: 'Care',
          icon: 'bi bi-hospital',
          active: false,
          route: '/care'
        },
        {
          name: '',
          icon: 'img',
          active: true,
          route: '/home'
        },
        {
          name: 'Add New',
          icon: 'bi bi-plus-circle',
          active: false,
          route: '/add-new'
        },
        {
          name: 'More',
          icon: 'bi bi-list',
          active: false,
          action: () => {
            this.openMoreNav();
          }
        }
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
        
      ]);
    } else {
      this.navBtn.set([
        {
          name: 'Home',
          icon: 'bi bi-house',
          active: true,
          route: '/home'
        },
        {
          name: 'Log in',
          icon: 'bi bi-box-arrow-right',
          active: false,
          route: '',
          action: () => {
            localStorage.removeItem('token');
            this.router.navigate(['/login']);
          }
        },
      ]);
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    const route = tab === 'home' ? '/' : `/${tab}`;
    this.router.navigate([route]);
  }

  private getTabFromUrl(url: string): string {
    const path = url.split('/')[1];
    return path ? path : 'home';
  }

  openMoreNav(): void {
    this.bottomSheet.open(MoreNavComponent, {
      panelClass: 'more-nav-bottom-sheet',
      disableClose: true
    });
  }
}

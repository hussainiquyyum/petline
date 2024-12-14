import { Component, inject } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { AuthService } from '../../../service/auth.service';

@Component({
  selector: 'app-more-nav',
  templateUrl: './more-nav.component.html',
  styleUrls: ['./more-nav.component.scss'],
  standalone: false,
})
export class MoreNavComponent {
  private bottomSheetRef = inject(MatBottomSheetRef<MoreNavComponent>);
  private router = inject(Router);
  private authService = inject(AuthService);

  closeBottomSheet(): void {
    this.bottomSheetRef.dismiss();
  }

  navigateTo(route: string): void {
    if (route === '/logout') {
      this.authService.logout().subscribe({
        next: (res: any) => {
          console.log(res);
          this.closeBottomSheet();
        },
        error: (err: any) => {
          console.log(err);
        }
      });
    } else {
      this.router.navigate([route]);
      this.closeBottomSheet();
    }
  }
}

import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { AuthService } from '../../../service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'hitpos-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class POSHeaderComponent implements OnInit {
  @Output() onAddMenu: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() posPage: string = '';
  @Input() isAddMenu: boolean = false;
  public clock: string = '';
  public email: string = '';
  private _authService = inject(AuthService);
  private _router = inject(Router);
  constructor() { }

  ngOnInit() {
    this._getUser();

    this.clock = this.getTime();
    setInterval(() => {
      this.clock = this.getTime();
    }, 10000);

  }

  getTime() {
    const today = new Date();
    const h = today.getHours();
    const m = today.getMinutes();
    const a = h >= 12 ? 'pm' : 'am';
    const formattedH = (h % 12 || 12).toString().padStart(2, '0');
    const formattedM = m.toString().padStart(2, '0');

    return `${formattedH}:${formattedM}${a}`;
  }

  onLogout() {
      this._router.navigate(['/page/login']);
      localStorage.clear();
      this._authService.logout().subscribe((res: any) => {
        console.log(res);
        this._router.navigate(['/page/login']);
        localStorage.clear();
      });
  }

  private _getUser() {
    this._authService.getMyInfo().subscribe((res: any) => {
      this.email = res.email;
    });
  }

}

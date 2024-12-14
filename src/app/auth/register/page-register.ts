import { Component, inject } from '@angular/core';
import { Router }    from '@angular/router';
import { FormControl, FormGroup, NgForm, Validators }    from '@angular/forms';
import { AppSettings } from '../../service/app-settings.service';
import { AuthService } from '../../service/auth.service';
import { AppVariablesService } from '../../service/app-variables.service';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'page-register',
  templateUrl: './page-register.html',
  standalone: false
})

export class RegisterPage {
  private appSettings = inject(AppSettings);
  private authService = inject(AuthService);
  private router = inject(Router);
  public brandName = inject(AppVariablesService).brandName;
  public isLoading = false;

  public form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.email]),
    mobile: new FormControl('', [Validators.required, Validators.minLength(10), Validators.pattern(/^[0-9]{10}$/), Validators.maxLength(10)]),
    gender: new FormControl('', [Validators.required]),
    dob: new FormControl<Date | null>(null, [Validators.required]),
    terms: new FormControl('', [Validators.required]),
  });
  
  constructor() {
    this.appSettings.appSidebarNone = true;
    this.appSettings.appHeaderNone = true;
    this.appSettings.appContentClass = 'p-0';
  }
  
  ngOnDestroy() {
    this.appSettings.appSidebarNone = false;
    this.appSettings.appHeaderNone = false;
    this.appSettings.appContentClass = '';
  }

  onMobileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let inputValue = input.value.replace(/\D/g, '');
    if (inputValue.length > 10) {
      inputValue = inputValue.slice(0, 10);
    }
    this.form.get('mobile')?.setValue(inputValue);
  }
  
	formSubmit() {
    this.isLoading = true;
    // this.router.navigate(['/']);
    // console.log(this.form.value);
    this.authService.register(this.form.value).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (res: any) => {
        console.log(res);
        Swal.fire({
          title: 'Register Success',
          text: 'OTP sent to your mobile number',
          icon: 'success',
          position: 'top',
          showConfirmButton: false,
          timerProgressBar: true,
          toast: true,
          timer: 3000
        });
        this.router.navigate(['/otp'], { queryParams: { phone: this.form.get('mobile')?.value } });
      },
      error: (err: any) => {
        console.log(err);
        Swal.fire({
          title: 'Register Error',
          text: err.error.error,
          icon: 'error',
          position: 'top',
          showConfirmButton: false,
          timerProgressBar: true,
          toast: true,
          timer: 3000
        });
      }
    });
  }
}

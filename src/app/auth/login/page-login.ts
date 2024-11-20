import { AfterViewInit, Component, ElementRef, inject, OnDestroy, Renderer2 } from '@angular/core';
import { Router }    from '@angular/router';
import { FormBuilder, FormGroup, NgForm, Validators }    from '@angular/forms';
import { AppSettings } from '../../service/app-settings.service';
import { AuthService } from '../../service/auth.service';
import { Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'page-login',
  templateUrl: './page-login.html'
})

export class LoginPage implements OnDestroy, AfterViewInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private appSettings = inject(AppSettings);
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private fb = inject(FormBuilder);
  private endSubs: Subject<void> = new Subject();

  public isOtpSent: boolean = false;
  public mobile: string = '';
  public mobileOtp: string = '';
  public isLoading: boolean = false;
  public otp: string = '';
  public maskedMobile: any;
  public resendOTP: boolean = false;
  public countdown: string = '';
  public otpConfig = {
    length: 6,
    allowNumbersOnly: true,
    isPasswordInput: true,
    inputStyles: {
      width: '50px',
      height: '50px',
      'font-size': '20px',
      'border-radius': '4px',
      border: '1px solid #ccc'
    },
    pattern: "[0-9]*"
  };
  form: FormGroup = this.fb.group({
    otp: ['', Validators.required]
  });
  interval:any;
  
  constructor() {
    this.appSettings.appSidebarNone = true;
    this.appSettings.appHeaderNone = true;
    this.appSettings.appContentClass = 'p-0';
  }
  
  ngOnDestroy() {
    this.appSettings.appSidebarNone = false;
    this.appSettings.appHeaderNone = false;
    this.appSettings.appContentClass = '';
    clearInterval(this.interval);
    this.endSubs.next();
    this.endSubs.complete();
  }
  
  getOTP() {
    if (!this.mobile || this.mobile.length !== 10 || !/^\d+$/.test(this.mobile)) return;
    this.isLoading = true;
    this.authService.customerGetOtp(this.mobile).pipe(takeUntil(this.endSubs)).subscribe({
      next: (res) => {
        this.isOtpSent = true;
        this.isLoading = false;
        this.maskedMobile = res.maskedMobileNumber;
        const {resendOTP, countdown} = this.startTimer(60);
        this.resendOTP = resendOTP;
        this.countdown = countdown ?? '';
        console.log(resendOTP, countdown);
        this.router.navigate(['/otp'], {queryParams: {phone: this.mobile}});
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          title: 'Login Error',
          text: err.error.error,
          icon: 'error',
          position: 'top',
          showConfirmButton: false,
          toast: true,
          timer: 3000
        });
      }
    });
  }

  startTimer(duration: number) {
    let timer = duration;
    let resendOTP = false;
    let countdown;
    this.interval = setInterval(() => {
      const minutes = Math.floor(timer / 60);
      let seconds = timer % 60;
      seconds = seconds < 10 ? 0 + seconds : seconds;
      countdown = `${minutes}:${seconds}`;
      console.log(countdown);
      if (--timer < 0) {
        resendOTP = true;
        clearInterval(this.interval);
      }
    }, 1000);
    return {resendOTP, countdown};
  }

  changeMobile() {
    this.mobile = '';
    this.maskedMobile = '';
    this.isOtpSent = false;
    this.isLoading = false;
    this.endSubs.next();
    this.endSubs.complete();
  }

	// login(f: NgForm) {
  //   this.authService.customerLogin(f.value.mobile, f.value.mobileOtp).subscribe((res) => {
  //     this.router.navigate(['/']);
  //   });
  // }
  verifyOTP(event?: any) {
    this.otp = event??this.otp;
    console.log('verifyOTP', event);
    console.log('verifyOTP', this.otp);
    if(this.otp.length !== 6) return;
    this.authService.customerLogin(this.mobile, this.otp).subscribe({
      next: (res) => {
        localStorage.setItem('accessToken', res.token);
        this.router.navigate(['/']);
        Swal.fire({
          title: 'Success',
          text: res.message,
          icon: 'success',
          position: 'top',
          showConfirmButton: false,
          toast: true,
          timer: 3000
        });
      },
      error: (err) => {
        console.log(err);
        Swal.fire({
          title: err.error.error,
          icon: 'error',
          position: 'top',
          showConfirmButton: false,
          toast: true,
          timer: 3000
        });
      }
    });
  }

  ngAfterViewInit() {
    // Add pattern and inputmode attributes to all OTP input fields
    if(this.isOtpSent) {
        const otpInputs = this.el.nativeElement.querySelectorAll('input[name="otp"]');
        otpInputs.forEach((input:any) => {
        this.renderer.setAttribute(input, 'pattern', '[0-9]*');
        this.renderer.setAttribute(input, 'inputmode', 'numeric');
      });
    }
  }
}

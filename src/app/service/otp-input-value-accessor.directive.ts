import { Directive, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { NgOtpInputComponent } from 'ng-otp-input';

@Directive({
    selector: 'ng-otp-input',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => NgOtpInputValueAccessorDirective),
            multi: true
        }
    ],
    standalone: false
})
export class NgOtpInputValueAccessorDirective implements ControlValueAccessor {
  constructor(private host: NgOtpInputComponent) {}

  writeValue(value: any): void {
    this.host.otpForm.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.host.otpForm.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.host.otpForm.statusChanges.subscribe(fn);
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.host.otpForm.disable();
    } else {
      this.host.otpForm.enable();
    }
  }
}
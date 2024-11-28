import { Component, Input, signal } from '@angular/core';

@Component({
    selector: 'app-loader',
    templateUrl: './loader.component.html',
    standalone: false
})
export class LoaderComponent {
  @Input() isLoading = signal(false);

}
